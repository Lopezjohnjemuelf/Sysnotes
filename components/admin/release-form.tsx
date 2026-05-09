"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { TenantMarkdown } from "@/components/tenant";
import { InlineErrorBanner } from "@/components/admin/state";
import type {
  AdminRelease,
  AdminReleaseStatus as ReleaseStatus,
} from "@/lib/releases/admin";
import { PersistenceError } from "@/lib/errors";
import { useOptionalAdminPreview } from "./admin-preview-context";

type ReleaseFormProps = {
  initialRelease?: AdminRelease | null;
  onCancel: () => void;
  onSave: (release: AdminRelease) => Promise<void> | void;
  previewPane?: ReactNode;
};

type ReleaseFormState = {
  version: string;
  date: string;
  title: string;
  summary: string;
  body: string;
  tags: string;
  status: ReleaseStatus;
  shareToken: string;
};

type MarkdownEditorTab = "write" | "preview";

type MarkdownTool = "heading" | "bold" | "list" | "code";

const defaultFormState: ReleaseFormState = {
  version: "",
  date: "",
  title: "",
  summary: "",
  body: "",
  tags: "",
  status: "Draft",
  shareToken: "",
};

function getInitialState(release?: AdminRelease | null): ReleaseFormState {
  if (!release) {
    return defaultFormState;
  }

  return {
    version: release.version,
    date: release.date,
    title: release.title,
    summary: release.summary,
    body: release.body ?? "",
    tags: release.tags.join(", "),
    status: release.status,
    shareToken: release.shareToken ?? "",
  };
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function ReleaseForm({
  initialRelease,
  onCancel,
  onSave,
  previewPane,
}: ReleaseFormProps) {
  const adminPreview = useOptionalAdminPreview();
  const setPreviewRelease = adminPreview?.setPreviewRelease;
  const setPreviewVisible = adminPreview?.setIsPreviewVisible;
  const formRef = useRef<HTMLFormElement | null>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [formState, setFormState] = useState(() =>
    getInitialState(initialRelease),
  );
  const [errors, setErrors] = useState<Partial<ReleaseFormState>>({});
  const [saveError, setSaveError] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [markdownTab, setMarkdownTab] = useState<MarkdownEditorTab>("write");
  const saveErrorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setFormState(getInitialState(initialRelease));
    setErrors({});
    setSaveError(false);
  }, [initialRelease]);

  useEffect(() => {
    return () => {
      if (saveErrorTimerRef.current) {
        clearTimeout(saveErrorTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setPreviewRelease?.({
      version: formState.version,
      date: formState.date,
      title: formState.title,
      summary: formState.summary,
      body: formState.body,
      tags: parseTags(formState.tags),
      status: formState.status,
      shareToken: formState.shareToken,
    });

    return () => {
      setPreviewRelease?.(null);
    };
  }, [formState, setPreviewRelease]);

  useEffect(() => {
    setPreviewVisible?.(isPreviewVisible);
  }, [isPreviewVisible, setPreviewVisible]);

  function updateField<Field extends keyof ReleaseFormState>(
    field: Field,
    value: ReleaseFormState[Field],
  ) {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }));
    setErrors((currentErrors) => {
      const { [field]: _fieldError, ...remainingErrors } = currentErrors;

      return remainingErrors;
    });
    setSaveError(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Partial<ReleaseFormState> = {};

    if (!formState.version.trim()) {
      nextErrors.version = "Version is required.";
    }

    if (!formState.title.trim()) {
      nextErrors.title = "Title is required.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await onSave({
        id: initialRelease?.id ?? crypto.randomUUID(),
        version: formState.version.trim(),
        date: formState.date,
        title: formState.title.trim(),
        summary: formState.summary.trim(),
        body: formState.body.trim() || undefined,
        tags: parseTags(formState.tags),
        status: formState.status,
        shareToken:
          formState.status === "Private"
            ? formState.shareToken.trim() || undefined
            : undefined,
      });
    } catch (err) {
      if (!(err instanceof PersistenceError)) {
        throw err;
      }

      setSaveError(true);

      if (saveErrorTimerRef.current) {
        clearTimeout(saveErrorTimerRef.current);
      }

      saveErrorTimerRef.current = setTimeout(() => {
        setSaveError(false);
      }, 4000);
    }
  }

  function generateShareToken() {
    updateField("shareToken", crypto.randomUUID());
  }

  function applyMarkdownTool(tool: MarkdownTool) {
    const textarea = bodyTextareaRef.current;
    const body = formState.body;
    const selectionStart = textarea?.selectionStart ?? body.length;
    const selectionEnd = textarea?.selectionEnd ?? body.length;
    const selectedText = body.slice(selectionStart, selectionEnd);
    let nextText = "";
    let nextSelectionStart = selectionStart;
    let nextSelectionEnd = selectionEnd;

    if (tool === "heading") {
      const fallback = "Section heading";
      nextText = `## ${selectedText || fallback}`;
      nextSelectionStart = selectionStart + 3;
      nextSelectionEnd = nextSelectionStart + (selectedText || fallback).length;
    }

    if (tool === "bold") {
      const fallback = "important update";
      nextText = `**${selectedText || fallback}**`;
      nextSelectionStart = selectionStart + 2;
      nextSelectionEnd = nextSelectionStart + (selectedText || fallback).length;
    }

    if (tool === "list") {
      const fallback = "Release detail";
      nextText = (selectedText || fallback)
        .split("\n")
        .map((line) => `- ${line.replace(/^- /, "")}`)
        .join("\n");
      nextSelectionEnd = selectionStart + nextText.length;
    }

    if (tool === "code") {
      const fallback = "code";
      nextText = `\`${selectedText || fallback}\``;
      nextSelectionStart = selectionStart + 1;
      nextSelectionEnd = nextSelectionStart + (selectedText || fallback).length;
    }

    const nextBody = `${body.slice(0, selectionStart)}${nextText}${body.slice(
      selectionEnd,
    )}`;

    updateField("body", nextBody);
    setMarkdownTab("write");
    window.requestAnimationFrame(() => {
      bodyTextareaRef.current?.focus();
      bodyTextareaRef.current?.setSelectionRange(
        nextSelectionStart,
        nextSelectionEnd,
      );
    });
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit} ref={formRef}>
      <div className="border-b border-[var(--border-subtle)] pb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-muted-1)]">
              {initialRelease ? "Edit release" : "New release"}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal">
              {initialRelease ? initialRelease.version : "Create release"}
            </h2>
            <p className="mt-2 text-xs italic text-[var(--text-muted-4)]">
              What you see is what you get.
            </p>
          </div>
          <button
            className="cursor-pointer border-0 bg-transparent p-0 text-xs text-[var(--text-muted-4)] underline-offset-4 hover:underline"
            onClick={() =>
              setIsPreviewVisible((currentVisibility) => !currentVisibility)
            }
            type="button"
          >
            {isPreviewVisible ? "Hide preview" : "Show preview"}
          </button>
        </div>
      </div>

      {previewPane && isPreviewVisible ? previewPane : null}

      <label className="grid gap-2">
        <span className="text-sm font-semibold">Version</span>
        <input
          className="rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-base text-[var(--text-primary)] outline-none transition focus:border-[var(--admin-input-focus)]"
          onChange={(event) => updateField("version", event.target.value)}
          placeholder="v2.5.0"
          type="text"
          value={formState.version}
        />
        {errors.version ? (
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {errors.version}
          </span>
        ) : null}
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold">Date</span>
        <input
          className="rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-base text-[var(--text-primary)] outline-none transition focus:border-[var(--admin-input-focus)]"
          onChange={(event) => updateField("date", event.target.value)}
          type="date"
          value={formState.date}
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold">Title</span>
        <input
          className="rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-base text-[var(--text-primary)] outline-none transition focus:border-[var(--admin-input-focus)]"
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="Release title"
          type="text"
          value={formState.title}
        />
        {errors.title ? (
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {errors.title}
          </span>
        ) : null}
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold">Summary</span>
        <textarea
          className="resize-none rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-base leading-7 text-[var(--text-primary)] outline-none transition focus:border-[var(--admin-input-focus)]"
          onChange={(event) => updateField("summary", event.target.value)}
          placeholder="Brief release summary"
          rows={3}
          value={formState.summary}
        />
      </label>

      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold">Release body</span>
          <span className="text-xs italic text-[var(--text-muted-4)]">
            What you see is what you get.
          </span>
        </div>

        <div className="border border-[var(--admin-input-border)] bg-[var(--surface-card)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] p-2">
            <div className="flex gap-1">
              {(["write", "preview"] as const).map((tab) => (
                <button
                  className={
                    markdownTab === tab
                      ? "rounded-md bg-[var(--accent-bg)] px-3 py-1.5 text-sm font-semibold capitalize text-[var(--accent-text)]"
                      : "rounded-md px-3 py-1.5 text-sm font-semibold capitalize text-[var(--text-muted-4)] transition hover:bg-[var(--tag-bg)] hover:text-[var(--text-primary)]"
                  }
                  key={tab}
                  onClick={() => setMarkdownTab(tab)}
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex gap-1" aria-label="Markdown toolbar">
              {[
                { tool: "heading", icon: "ti-heading", label: "Heading" },
                { tool: "bold", icon: "ti-bold", label: "Bold" },
                { tool: "list", icon: "ti-list", label: "Bullet list" },
                { tool: "code", icon: "ti-code", label: "Inline code" },
              ].map(({ tool, icon, label }) => (
                <button
                  aria-label={label}
                  className="grid h-8 w-8 place-items-center rounded-md text-[var(--text-muted-4)] transition hover:bg-[var(--tag-bg)] hover:text-[var(--text-primary)]"
                  key={tool}
                  onClick={() => applyMarkdownTool(tool as MarkdownTool)}
                  title={label}
                  type="button"
                >
                  <i aria-hidden="true" className={`ti ${icon} text-base`} />
                </button>
              ))}
            </div>
          </div>

          {markdownTab === "write" ? (
            <textarea
              className="min-h-56 w-full resize-y border-0 bg-[var(--surface-card)] px-3 py-2 text-base leading-7 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted-4)]"
              onChange={(event) => updateField("body", event.target.value)}
              placeholder="Markdown details, bullet lists, and follow-up notes"
              ref={bodyTextareaRef}
              rows={9}
              value={formState.body}
            />
          ) : (
            <TenantMarkdown
              emptyState="Start writing to preview the release body."
              markdown={formState.body}
              variant="preview"
            />
          )}
        </div>

        <span className="text-xs text-[var(--text-muted-4)]">
          Markdown syncs live to the admin preview pane and appears on the
          tenant release detail page.
        </span>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-semibold">Tags</span>
        <input
          className="rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-base text-[var(--text-primary)] outline-none transition focus:border-[var(--admin-input-focus)]"
          onChange={(event) => updateField("tags", event.target.value)}
          placeholder="Product, UX, Website"
          type="text"
          value={formState.tags}
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold">Status</span>
        <select
          className="rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-base text-[var(--text-primary)] outline-none transition focus:border-[var(--admin-input-focus)]"
          onChange={(event) =>
            updateField("status", event.target.value as ReleaseStatus)
          }
          value={formState.status}
        >
          <option>Published</option>
          <option>Draft</option>
          <option>Private</option>
        </select>
      </label>

      {formState.status === "Private" ? (
        <div className="grid gap-2 border border-[var(--border-subtle)] bg-[var(--surface-page)] p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold">Private share token</span>
            <button
              className="text-xs font-semibold text-[var(--text-muted-5)] underline underline-offset-4 transition hover:text-[var(--text-primary)]"
              onClick={generateShareToken}
              type="button"
            >
              Generate
            </button>
          </div>
          <input
            className="rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--admin-input-focus)]"
            onChange={(event) => updateField("shareToken", event.target.value)}
            placeholder="Generated on save when empty"
            type="text"
            value={formState.shareToken}
          />
          <p className="text-xs leading-5 text-[var(--text-muted-4)]">
            Private releases stay off the tenant landing page and require this
            token on the release URL. Save the release, then copy its private
            link from the releases table.
          </p>
        </div>
      ) : null}

      <div className="mt-3 flex items-center gap-4 border-t border-[var(--border-subtle)] pt-5">
        <button
          className="rounded-full bg-[var(--admin-save-bg)] px-5 py-2.5 text-sm font-semibold text-[var(--admin-save-text)]"
          type="submit"
        >
          Save
        </button>
        <button
          className="text-sm font-semibold text-[var(--text-muted-5)] underline underline-offset-4 transition hover:text-[var(--text-primary)]"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
      </div>
      {saveError ? (
        <InlineErrorBanner
          description="The release could not be saved. Browser storage may be full or temporarily unavailable."
          icon="ti-device-floppy-off"
          primaryAction={{
            icon: "ti-refresh",
            label: "Retry",
            onClick: () => formRef.current?.requestSubmit(),
          }}
          secondaryAction={{
            icon: "ti-arrow-left",
            label: "Back to releases",
            onClick: onCancel,
          }}
          title="Failed to save release"
        />
      ) : null}
    </form>
  );
}
