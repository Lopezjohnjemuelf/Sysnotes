"use client";

import { signOut } from "next-auth/react";

const WELCOME_MODAL_KEY = "sysnotes:admin-welcome:v1";

export function AdminLogoutButton() {
  function handleLogout() {
    window.localStorage.removeItem(WELCOME_MODAL_KEY);
    void signOut({ callbackUrl: "/login" });
  }

  return (
    <button
      className="mt-4 w-full rounded-md px-3 py-2 text-left text-sm text-[var(--text-muted-5)] transition hover:bg-[var(--tag-bg)] hover:text-[var(--text-primary)]"
      onClick={handleLogout}
      type="button"
    >
      Logout
    </button>
  );
}
