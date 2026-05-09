"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ReleaseForm } from "@/components/admin/release-form";
import {
  EmptyStateCard,
  ErrorStateCard,
  InlineErrorBanner,
} from "@/components/admin/state";
import { useTenantIdentity } from "@/components/admin/tenant-identity-ui";
import {
  getPrivateReleaseUrl,
  prepareAdminReleaseForSave,
  toAdminRelease,
  toPersistedRelease,
  type AdminRelease,
  type AdminReleaseStatus,
} from "@/lib/releases/admin";
import {
  RELEASES_STORAGE_KEY,
  getReleaseService,
} from "@/lib/releases/persistence";
import { TENANT_IDENTITY_STORAGE_KEY } from "@/lib/tenant/identity";
import { PersistenceError } from "@/lib/errors";
import { shouldUseTenantApi } from "@/lib/persistence/errors";
import { getTenantService } from "@/lib/tenant/service";
import {
  ADMIN_SETTINGS_STORAGE_KEY,
  DEFAULT_ADMIN_SETTINGS,
  parseStoredAdminSettings,
} from "@/lib/admin/settings";

const WELCOME_MODAL_KEY = "sysnotes:admin-welcome:v1";

type ReleasesPageFailure =
  | "load"
  | "save"
  | "storage-unavailable"
  | "corrupt-releases"
  | "corrupt-identity";

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function isInvalidJson(value: string | null) {
  if (value === null) {
    return false;
  }

  try {
    JSON.parse(value);
    return false;
  } catch (err) {
    console.warn(err);
    return true;
  }
}

function isInvalidReleaseStorage(value: string | null) {
  if (isInvalidJson(value)) {
    return true;
  }

  if (value === null) {
    return false;
  }

  try {
    return !Array.isArray(JSON.parse(value));
  } catch {
    return true;
  }
}

function refreshPage() {
  window.location.reload();
}

function StatusPill({ status }: { status: AdminReleaseStatus }) {
  const className =
    status === "Published"
      ? "bg-[var(--accent-bg)] text-[var(--accent-text)]"
      : "bg-[var(--tag-bg)] text-[var(--text-muted-5)]";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${className}`}
    >
      {status === "Private" ? (
        <i aria-hidden="true" className="ti ti-lock text-[12px]" />
      ) : null}
      {status}
    </span>
  );
}

function TagList({ release }: { release: AdminRelease }) {
  const visibleTags = release.tags.slice(0, 3);
  const hiddenTagCount = release.tags.length - visibleTags.length;

  if (release.tags.length === 0) {
    return <span className="text-[var(--text-muted-5)]">No tags</span>;
  }

  return (
    <div className="flex max-w-xs flex-wrap gap-2">
      {visibleTags.map((tag) => (
        <span
          className="rounded-full bg-[var(--tag-bg)] px-2.5 py-1 text-xs text-[var(--text-muted-5)]"
          key={`${release.id}-${tag}`}
        >
          {tag}
        </span>
      ))}
      {hiddenTagCount > 0 ? (
        <span className="rounded-full bg-[var(--tag-bg)] px-2.5 py-1 text-xs text-[var(--text-muted-5)]">
          +{hiddenTagCount} more
        </span>
      ) : null}
    </div>
  );
}

function RowActionButton({
  icon,
  label,
  onClick,
}: {
  icon: "ti-copy" | "ti-edit" | "ti-trash";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-full text-[var(--text-muted-4)] transition hover:bg-[var(--tag-bg)] hover:text-[var(--text-primary)]"
      onClick={onClick}
      title={label}
      type="button"
    >
      <i aria-hidden="true" className={`ti ${icon} text-[12px]`} />
    </button>
  );
}

function WelcomeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--text-muted-7)] px-4">
      <section className="w-full max-w-md rounded-lg border border-[var(--border-light)] bg-[var(--surface-card)] p-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted-1)]">
          Admin Portal
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-normal">
          Welcome back.
        </h2>
        <p className="mt-4 text-sm leading-6 text-[var(--text-muted-5)]">
          Manage releases, review draft status, and keep the changelog current
          from here.
        </p>
        <button
          className="mt-6 rounded-full bg-[var(--accent-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)]"
          onClick={onClose}
          type="button"
        >
          Continue
        </button>
      </section>
    </div>
  );
}

export default function AdminReleasesPage() {
  const identity = useTenantIdentity();
  const releaseService = useMemo(
    () => getReleaseService(identity.slug),
    [identity.slug],
  );
  const useTenantApi = shouldUseTenantApi();
  const selectAllCheckboxRef = useRef<HTMLInputElement | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [releases, setReleases] = useState<AdminRelease[]>([]);
  const [selectedReleaseIds, setSelectedReleaseIds] = useState<string[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingReleaseId, setEditingReleaseId] = useState<string | null>(null);
  const [confirmingReleaseId, setConfirmingReleaseId] = useState<string | null>(
    null,
  );
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [copiedReleaseId, setCopiedReleaseId] = useState<string | null>(null);
  const [isBulkDeleteConfirming, setIsBulkDeleteConfirming] = useState(false);
  const [isTenantConfigured, setIsTenantConfigured] = useState(true);
  const [pageFailure, setPageFailure] = useState<ReleasesPageFailure | null>(
    null,
  );
  const [isOffline, setIsOffline] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [releasesPerPage, setReleasesPerPage] = useState(
    DEFAULT_ADMIN_SETTINGS.releasesPerPage,
  );
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedReleaseIdSet = useMemo(
    () => new Set(selectedReleaseIds),
    [selectedReleaseIds],
  );
  const editingRelease = useMemo(
    () =>
      editingReleaseId
        ? releases.find((release) => release.id === editingReleaseId) ?? null
        : null,
    [editingReleaseId, releases],
  );
  const selectedReleaseCount = selectedReleaseIds.length;
  const hasSelectedReleases = selectedReleaseCount > 0;
  const areAllReleasesSelected =
    releases.length > 0 && selectedReleaseCount === releases.length;
  const areSomeReleasesSelected =
    selectedReleaseCount > 0 && selectedReleaseCount < releases.length;
  const totalPages = Math.max(1, Math.ceil(releases.length / releasesPerPage));
  const normalizedCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (normalizedCurrentPage - 1) * releasesPerPage;
  const paginatedReleases = releases.slice(
    pageStartIndex,
    pageStartIndex + releasesPerPage,
  );
  const pageEndIndex = Math.min(pageStartIndex + releasesPerPage, releases.length);

  useEffect(() => {
    let isMounted = true;

    async function loadReleases() {
      try {
        const storedIdentity = useTenantApi
          ? await getTenantService(identity.slug).load()
          : window.localStorage.getItem(TENANT_IDENTITY_STORAGE_KEY);
        const storedReleaseValue = useTenantApi
          ? null
          : window.localStorage.getItem(RELEASES_STORAGE_KEY);

        if (!useTenantApi && isInvalidJson(storedIdentity as string | null)) {
          if (isMounted) {
            setPageFailure("corrupt-identity");
            setHasLoaded(true);
          }
          return;
        }

        if (isInvalidReleaseStorage(storedReleaseValue)) {
          if (isMounted) {
            setPageFailure("corrupt-releases");
            setHasLoaded(true);
          }
          return;
        }

        if (storedIdentity === null) {
          if (isMounted) {
            setReleases([]);
            setIsTenantConfigured(false);
            setShowWelcomeModal(
              window.localStorage.getItem(WELCOME_MODAL_KEY) === "pending",
            );
            setHasLoaded(true);
          }
          return;
        }

        const storedReleases = await releaseService.getAll();

        if (!isMounted) {
          return;
        }

        setReleases(storedReleases.map(toAdminRelease));
        setIsTenantConfigured(true);
        setShowWelcomeModal(
          window.localStorage.getItem(WELCOME_MODAL_KEY) === "pending",
        );
        setHasLoaded(true);
      } catch (err) {
        console.warn(err);

        if (!isMounted) {
          return;
        }

        setPageFailure(
          err instanceof DOMException ? "storage-unavailable" : "load",
        );
        setHasLoaded(true);
      }
    }

    void loadReleases();

    return () => {
      isMounted = false;
    };
  }, [identity.slug, releaseService, useTenantApi]);

  useEffect(() => {
    function syncAdminSettings() {
      setReleasesPerPage(
        parseStoredAdminSettings(
          window.localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY),
        ).releasesPerPage,
      );
      setCurrentPage(1);
    }

    syncAdminSettings();
    window.addEventListener("storage", syncAdminSettings);
    window.addEventListener("sysnotes:admin-settings-change", syncAdminSettings);

    return () => {
      window.removeEventListener("storage", syncAdminSettings);
      window.removeEventListener(
        "sysnotes:admin-settings-change",
        syncAdminSettings,
      );
    };
  }, []);

  useEffect(() => {
    setCurrentPage((currentPageValue) => Math.min(currentPageValue, totalPages));
  }, [totalPages]);

  useEffect(() => {
    function syncOnlineState() {
      setIsOffline(navigator.onLine === false);
    }

    syncOnlineState();
    window.addEventListener("online", syncOnlineState);
    window.addEventListener("offline", syncOnlineState);

    return () => {
      window.removeEventListener("online", syncOnlineState);
      window.removeEventListener("offline", syncOnlineState);
    };
  }, []);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = areSomeReleasesSelected;
    }
  }, [areSomeReleasesSelected]);

  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) {
        clearTimeout(confirmTimerRef.current);
      }

      if (copiedTimerRef.current) {
        clearTimeout(copiedTimerRef.current);
      }
    };
  }, []);

  function openNewReleasePanel() {
    setEditingReleaseId(null);
    setIsPanelOpen(true);
  }

  function openEditReleasePanel(release: AdminRelease) {
    setEditingReleaseId(release.id);
    setIsPanelOpen(true);
  }

  function closePanel() {
    setIsPanelOpen(false);
    setEditingReleaseId(null);
  }

  function clearSelection() {
    setSelectedReleaseIds([]);
    setIsBulkDeleteConfirming(false);
  }

  async function savePersistedRelease(release: AdminRelease) {
    await releaseService.save(toPersistedRelease(release));
  }

  async function deletePersistedReleases(releaseIds: string[]) {
    await Promise.all(
      releaseIds.map((releaseId) => releaseService.delete(releaseId)),
    );
  }

  function toggleReleaseSelection(releaseId: string) {
    setIsBulkDeleteConfirming(false);
    setSelectedReleaseIds((currentReleaseIds) =>
      currentReleaseIds.includes(releaseId)
        ? currentReleaseIds.filter(
            (currentReleaseId) => currentReleaseId !== releaseId,
          )
        : [...currentReleaseIds, releaseId],
    );
  }

  function toggleAllReleaseSelection() {
    setIsBulkDeleteConfirming(false);
    setSelectedReleaseIds(
      areAllReleasesSelected ? [] : releases.map((release) => release.id),
    );
  }

  async function saveRelease(release: AdminRelease) {
    const releaseToSave = prepareAdminReleaseForSave(release);
    const nextReleases = releases.some(
      (currentRelease) => currentRelease.id === releaseToSave.id,
    )
      ? releases.map((currentRelease) =>
          currentRelease.id === releaseToSave.id
            ? releaseToSave
            : currentRelease,
        )
      : [releaseToSave, ...releases];

    await savePersistedRelease(releaseToSave);
    setReleases(nextReleases);
    closePanel();
  }

  async function bulkUpdateStatus(
    status: Exclude<AdminReleaseStatus, "Private">,
  ) {
    if (!hasSelectedReleases) {
      return;
    }

    const nextReleases = releases.map((release) =>
      selectedReleaseIdSet.has(release.id)
        ? {
            ...release,
            status,
            shareToken: undefined,
          }
        : release,
    );
    const updatedReleases = nextReleases.filter((release) =>
      selectedReleaseIdSet.has(release.id),
    );

    try {
      setReleases(nextReleases);
      clearSelection();
      await Promise.all(updatedReleases.map(savePersistedRelease));
    } catch (err) {
      if (!(err instanceof PersistenceError)) {
        throw err;
      }

      setPageFailure("save");
    }
  }

  async function copyPrivateLink(release: AdminRelease) {
    const releaseWithToken =
      release.shareToken && release.shareToken.trim()
        ? release
        : {
            ...release,
            shareToken: crypto.randomUUID(),
          };
    const relativeUrl = getPrivateReleaseUrl(identity.slug, releaseWithToken);

    if (!relativeUrl) {
      return;
    }

    if (!release.shareToken) {
      const nextReleases = releases.map((currentRelease) =>
        currentRelease.id === release.id ? releaseWithToken : currentRelease,
      );

      try {
        setReleases(nextReleases);
        await savePersistedRelease(releaseWithToken);
      } catch (err) {
        if (!(err instanceof PersistenceError)) {
          throw err;
        }

        setPageFailure("save");
        return;
      }
    }

    try {
      await copyText(`${window.location.origin}${relativeUrl}`);
    } catch (err) {
      console.warn(err);
      setPageFailure("save");
      return;
    }
    setCopiedReleaseId(release.id);

    if (copiedTimerRef.current) {
      clearTimeout(copiedTimerRef.current);
    }

    copiedTimerRef.current = setTimeout(() => {
      setCopiedReleaseId(null);
    }, 2200);
  }

  function requestDelete(releaseId: string) {
    setConfirmingReleaseId(releaseId);

    if (confirmTimerRef.current) {
      clearTimeout(confirmTimerRef.current);
    }

    confirmTimerRef.current = setTimeout(() => {
      setConfirmingReleaseId(null);
    }, 3000);
  }

  async function confirmDelete(releaseId: string) {
    try {
      setReleases(releases.filter((release) => release.id !== releaseId));
      setSelectedReleaseIds((currentReleaseIds) =>
        currentReleaseIds.filter(
          (currentReleaseId) => currentReleaseId !== releaseId,
        ),
      );
      await deletePersistedReleases([releaseId]);
      setConfirmingReleaseId(null);
    } catch (err) {
      if (!(err instanceof PersistenceError)) {
        throw err;
      }

      setPageFailure("save");
    }
  }

  async function confirmBulkDelete() {
    if (!hasSelectedReleases) {
      return;
    }

    const releaseIdsToDelete = selectedReleaseIds;

    try {
      setReleases(
        releases.filter((release) => !selectedReleaseIdSet.has(release.id)),
      );
      clearSelection();
      await deletePersistedReleases(releaseIdsToDelete);
    } catch (err) {
      if (!(err instanceof PersistenceError)) {
        throw err;
      }

      setPageFailure("save");
    }
  }

  function closeWelcomeModal() {
    window.localStorage.setItem(WELCOME_MODAL_KEY, "seen");
    setShowWelcomeModal(false);
  }

  function resetCorruptedReleases() {
    window.localStorage.removeItem(RELEASES_STORAGE_KEY);
    refreshPage();
  }

  function resetCorruptedIdentity() {
    window.localStorage.removeItem(TENANT_IDENTITY_STORAGE_KEY);
    window.location.assign("/admin/identity");
  }

  if (!hasLoaded) {
    return (
      <div className="border border-[var(--border-light)] bg-[var(--surface-card)] p-6 text-sm text-[var(--text-muted-5)]">
        Loading admin releases...
      </div>
    );
  }

  if (pageFailure === "storage-unavailable") {
    return (
      <ErrorStateCard
        eyebrow="Local data unavailable"
        description="Sysnotes could not read local admin data from this browser. Enable local storage for the site, then refresh the admin portal."
        icon="ti-database-off"
        primaryAction={{
          icon: "ti-refresh",
          label: "Refresh page",
          onClick: refreshPage,
        }}
        secondaryAction={{
          href: "/admin/releases",
          icon: "ti-layout-dashboard",
          label: "Go to dashboard",
        }}
        title="Admin data could not be loaded"
      />
    );
  }

  if (pageFailure === "corrupt-releases") {
    return (
      <ErrorStateCard
        eyebrow="Local data fallback"
        description="Saved release data in this browser is missing required structure or is not readable JSON. Reset only the local release data to continue."
        icon="ti-database-exclamation"
        primaryAction={{
          icon: "ti-refresh",
          label: "Reset local data",
          onClick: resetCorruptedReleases,
          variant: "destructive",
        }}
        secondaryAction={{
          icon: "ti-reload",
          label: "Refresh page",
          onClick: refreshPage,
        }}
        title="Release storage looks corrupted"
      />
    );
  }

  if (pageFailure === "corrupt-identity") {
    return (
      <ErrorStateCard
        eyebrow="Local data fallback"
        description="Saved tenant identity data in this browser is not readable. Reset only the local identity data, then configure the tenant again."
        icon="ti-database-exclamation"
        primaryAction={{
          icon: "ti-refresh",
          label: "Reset local data",
          onClick: resetCorruptedIdentity,
          variant: "destructive",
        }}
        secondaryAction={{
          href: "/admin/identity",
          icon: "ti-palette",
          label: "Configure tenant identity",
        }}
        title="Tenant identity storage looks corrupted"
      />
    );
  }

  if (pageFailure === "load") {
    return (
      <ErrorStateCard
        eyebrow="Failed load"
        description="The releases table could not be loaded. Retry the view or return to the dashboard."
        icon="ti-cloud-off"
        primaryAction={{
          icon: "ti-refresh",
          label: "Retry",
          onClick: refreshPage,
        }}
        secondaryAction={{
          href: "/admin/identity",
          icon: "ti-palette",
          label: "Configure tenant identity",
        }}
        title="Releases could not be loaded"
      />
    );
  }

  if (pageFailure === "save") {
    return (
      <ErrorStateCard
        eyebrow="Failed save"
        description="The latest admin change could not be saved. Browser storage may be full or unavailable. Refresh the page before making more edits."
        icon="ti-device-floppy-off"
        primaryAction={{
          icon: "ti-refresh",
          label: "Refresh page",
          onClick: refreshPage,
        }}
        secondaryAction={{
          href: "/admin/releases",
          icon: "ti-notes",
          label: "Back to releases",
        }}
        title="Changes could not be saved"
      />
    );
  }

  return (
    <>
      {showWelcomeModal ? <WelcomeModal onClose={closeWelcomeModal} /> : null}

      <section>
        <header className="flex flex-col justify-between gap-5 border-b border-[var(--border-light)] pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted-1)]">
              Admin Portal
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-normal">
              Releases
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted-5)]">
              Publish, draft, and organize tenant release notes for the
              standalone public page at /[slug]/*.
            </p>
            <p className="mt-2 text-xs italic text-[var(--text-muted-4)]">
              What you see is what you get.
            </p>
          </div>

          <button
            className="w-fit rounded-full bg-[var(--accent-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-text)]"
            onClick={openNewReleasePanel}
            type="button"
          >
            New release
          </button>
        </header>

        {isOffline ? (
          <div className="mt-6">
            <InlineErrorBanner
              description="You appear to be offline. Local edits may still work, but network-backed admin saves and refreshes can fail until the connection returns."
              icon="ti-wifi-off"
              primaryAction={{
                icon: "ti-refresh",
                label: "Retry",
                onClick: refreshPage,
              }}
              secondaryAction={{
                href: "/admin/releases",
                icon: "ti-layout-dashboard",
                label: "Go to dashboard",
              }}
              title="Network connection is offline"
            />
          </div>
        ) : null}

        {!isTenantConfigured ? (
          <div className="mt-8">
            <EmptyStateCard
              eyebrow="Tenant not configured"
              description="Set the tenant brand, slug, colors, and preview defaults before publishing releases for a public changelog."
              icon="ti-palette"
              primaryAction={{
                href: "/admin/identity",
                icon: "ti-palette",
                label: "Configure tenant identity",
              }}
              secondaryAction={{
                href: "/admin/releases",
                icon: "ti-layout-dashboard",
                label: "Go to dashboard",
              }}
              title="Configure tenant identity first"
            />
          </div>
        ) : releases.length === 0 ? (
          <div className="mt-8">
            <EmptyStateCard
              description="There are no admin releases yet. Create the first release to start building the tenant changelog."
              icon="ti-notes"
              primaryAction={{
                icon: "ti-plus",
                label: "Create first release",
                onClick: openNewReleasePanel,
              }}
              secondaryAction={{
                href: "/admin/identity",
                icon: "ti-palette",
                label: "Configure tenant identity",
              }}
              title="No releases yet"
            />
          </div>
        ) : (

        <div className="mt-8 overflow-x-auto rounded-lg border border-[var(--border-light)] bg-[var(--surface-card)]">
          <div className="flex flex-col justify-between gap-3 border-b border-[var(--border-light)] px-4 py-3 sm:flex-row sm:items-center">
            <p className="text-sm text-[var(--text-muted-5)]">
              {hasSelectedReleases
                ? `${selectedReleaseCount} selected`
                : "Select releases to apply bulk actions."}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {isBulkDeleteConfirming ? (
                <>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    Delete selected?
                  </span>
                  <button
                    className="rounded-full bg-[var(--text-primary)] px-4 py-2 text-sm font-semibold text-[var(--surface-card)] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!hasSelectedReleases}
                    onClick={() => void confirmBulkDelete()}
                    type="button"
                  >
                    Confirm delete
                  </button>
                  <button
                    className="rounded-full border border-[var(--border-light)] px-4 py-2 text-sm font-semibold text-[var(--text-muted-5)] transition hover:text-[var(--text-primary)]"
                    onClick={() => setIsBulkDeleteConfirming(false)}
                    type="button"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="rounded-full border border-[var(--border-light)] px-4 py-2 text-sm font-semibold text-[var(--text-muted-5)] transition hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!hasSelectedReleases}
                    onClick={() => void bulkUpdateStatus("Published")}
                    type="button"
                  >
                    Publish all
                  </button>
                  <button
                    className="rounded-full border border-[var(--border-light)] px-4 py-2 text-sm font-semibold text-[var(--text-muted-5)] transition hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!hasSelectedReleases}
                    onClick={() => void bulkUpdateStatus("Draft")}
                    type="button"
                  >
                    Set to draft
                  </button>
                  <button
                    className="rounded-full border border-[var(--border-light)] px-4 py-2 text-sm font-semibold text-[var(--text-muted-5)] transition hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!hasSelectedReleases}
                    onClick={() => setIsBulkDeleteConfirming(true)}
                    type="button"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          <table className="w-full min-w-[62rem] border-collapse text-left text-sm">
            <thead className="border-b border-[var(--border-light)] text-[var(--text-muted-5)]">
              <tr>
                <th className="w-12 px-4 py-3 font-medium">
                  <input
                    aria-label="Select all releases"
                    checked={areAllReleasesSelected}
                    className="h-4 w-4 accent-[var(--accent-bg)]"
                    disabled={releases.length === 0}
                    onChange={toggleAllReleaseSelection}
                    ref={selectAllCheckboxRef}
                    type="checkbox"
                  />
                </th>
                <th className="px-4 py-3 font-medium">Version</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Tags</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {paginatedReleases.map((release) => (
                <tr key={release.id}>
                  <td className="px-4 py-4">
                    <input
                      aria-label={`Select ${release.version}`}
                      checked={selectedReleaseIdSet.has(release.id)}
                      className="h-4 w-4 accent-[var(--accent-bg)]"
                      onChange={() => toggleReleaseSelection(release.id)}
                      type="checkbox"
                    />
                  </td>
                  <td className="px-4 py-4 font-semibold">
                    {release.version}
                  </td>
                  <td className="px-4 py-4 text-[var(--text-muted-5)]">
                    {release.date || "No date"}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold">{release.title}</p>
                    <p className="mt-1 line-clamp-1 max-w-xs text-[var(--text-muted-5)]">
                      {release.summary || "No summary"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <StatusPill status={release.status} />
                  </td>
                  <td className="px-4 py-4">
                    <TagList release={release} />
                  </td>
                  <td className="px-4 py-4">
                    {confirmingReleaseId === release.id ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Confirm?</span>
                        <button
                          className="font-semibold text-[var(--text-primary)] underline underline-offset-4"
                          onClick={() => confirmDelete(release.id)}
                          type="button"
                        >
                          Yes
                        </button>
                        <button
                          className="text-[var(--text-muted-5)] underline underline-offset-4"
                          onClick={() => setConfirmingReleaseId(null)}
                          type="button"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {release.status === "Private" ? (
                          <RowActionButton
                            icon="ti-copy"
                            label={
                              copiedReleaseId === release.id
                                ? "Private link copied"
                                : "Copy private link"
                            }
                            onClick={() => void copyPrivateLink(release)}
                          />
                        ) : null}
                        <RowActionButton
                          icon="ti-edit"
                          label="Edit"
                          onClick={() => openEditReleasePanel(release)}
                        />
                        <RowActionButton
                          icon="ti-trash"
                          label="Delete"
                          onClick={() => requestDelete(release.id)}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col justify-between gap-3 border-t border-[var(--border-light)] px-4 py-3 sm:flex-row sm:items-center">
            <p className="text-sm text-[var(--text-muted-5)]">
              Showing {pageStartIndex + 1}-{pageEndIndex} of {releases.length}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                className="rounded-full border border-[var(--border-light)] px-4 py-2 text-sm font-semibold text-[var(--text-muted-5)] transition hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={normalizedCurrentPage === 1}
                onClick={() =>
                  setCurrentPage((currentPageValue) =>
                    Math.max(1, currentPageValue - 1),
                  )
                }
                type="button"
              >
                Previous
              </button>
              <span className="px-2 text-sm text-[var(--text-muted-5)]">
                Page {normalizedCurrentPage} of {totalPages}
              </span>
              <button
                className="rounded-full border border-[var(--border-light)] px-4 py-2 text-sm font-semibold text-[var(--text-muted-5)] transition hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={normalizedCurrentPage === totalPages}
                onClick={() =>
                  setCurrentPage((currentPageValue) =>
                    Math.min(totalPages, currentPageValue + 1),
                  )
                }
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        </div>
        )}
      </section>

      {isPanelOpen ? (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-[var(--text-muted-7)]"
          onClick={closePanel}
        >
          <aside
            className="h-full w-full max-w-[480px] overflow-y-auto border-l border-[var(--border-light)] bg-[var(--surface-card)] p-6 sm:w-[480px]"
            onClick={(event) => event.stopPropagation()}
          >
            {editingReleaseId && !editingRelease ? (
              <ErrorStateCard
                eyebrow="Release not found"
                description="This release is no longer available in the admin list. It may have been deleted or removed from local storage."
                icon="ti-file-alert"
                primaryAction={{
                  icon: "ti-arrow-left",
                  label: "Back to releases",
                  onClick: closePanel,
                }}
                secondaryAction={{
                  icon: "ti-plus",
                  label: "Create first release",
                  onClick: openNewReleasePanel,
                }}
                title="Release not found"
              />
            ) : (
              <ReleaseForm
                initialRelease={editingRelease}
                onCancel={closePanel}
                onSave={saveRelease}
              />
            )}
          </aside>
        </div>
      ) : null}
    </>
  );
}
