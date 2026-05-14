import { rm } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme";

function uniqueSlug(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function releasePayload(overrides: Partial<ReleasePayload> = {}): ReleasePayload {
  const id = overrides.id ?? randomUUID();
  const version = overrides.version ?? `v${Date.now()}`;

  return {
    id,
    version,
    date: "2026-05-10",
    title: `Smoke Release ${id}`,
    summary: "Smoke test release summary.",
    body: "Smoke test release body.",
    tags: ["smoke"],
    status: "draft",
    ...overrides,
  };
}

type ReleasePayload = {
  id: string;
  version: string;
  date: string;
  title: string;
  summary: string;
  body?: string;
  tags: string[];
  status: "published" | "draft" | "private";
  shareToken?: string;
};

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Password").fill(adminPassword);
  await Promise.all([
    page.waitForURL("**/admin/releases"),
    page.getByRole("button", { name: "Login" }).click(),
  ]);
}

async function seedTenant(request: APIRequestContext, slug: string) {
  const response = await request.put(`/api/tenant/${slug}/identity`, {
    data: {
      slug,
      brandName: `Smoke ${slug}`,
      logoUrl: null,
      accentBg: "#d7ef7d",
      accentText: "#263400",
      colorScheme: "light",
      fontFamily: "sans",
      badgePosition: "right",
      comingSoon: false,
      webhookUrl: "",
    },
  });

  expect(response.status()).toBe(200);
}

async function cleanupTenant(slug: string) {
  await Promise.all([
    rm(`data/tenant-${slug}.json`, { force: true }),
    rm(`data/releases-${slug}.json`, { force: true }),
    rm(`data/subscribers-${slug}.json`, { force: true }),
  ]);
}

test.describe("route status", () => {
  test("public routes return expected statuses", async ({ page }) => {
    await expect((await page.goto("/"))?.status()).toBe(200);
    await expect((await page.goto("/about"))?.status()).toBe(200);
    await expect((await page.goto("/login"))?.status()).toBe(200);
    await expect((await page.goto("/register"))?.status()).toBe(200);
  });

  test("authenticated admin routes return expected statuses", async ({ page }) => {
    await signIn(page);

    const adminResponse = await page.goto("/admin");
    expect(new URL(page.url()).pathname).toBe("/admin/releases");
    expect(adminResponse?.status()).toBe(200);

    await expect((await page.goto("/admin/settings"))?.status()).toBe(200);
  });

  test("authenticated users can still access register", async ({ page }) => {
    await signIn(page);

    await expect((await page.goto("/register"))?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe("/register");
  });

  test("unknown tenant routes return 404", async ({ page }) => {
    await expect((await page.goto("/nonexistent-slug-xyz"))?.status()).toBe(404);
  });
});

test.describe("admin auth", () => {
  test("protects admin routes and accepts only the configured password", async ({
    page,
  }) => {
    await page.goto("/admin/releases");
    expect(new URL(page.url()).pathname).toBe("/login");

    await page.getByLabel("Password").fill("definitely-wrong");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByText("Incorrect password.")).toBeVisible();
    expect(new URL(page.url()).pathname).toBe("/login");

    await page.goto("/admin/releases");
    expect(new URL(page.url()).pathname).toBe("/login");

    await page.getByLabel("Password").fill(adminPassword);
    await Promise.all([
      page.waitForURL("**/admin/releases"),
      page.getByRole("button", { name: "Login" }).click(),
    ]);

    await expect((await page.goto("/admin/releases"))?.status()).toBe(200);
  });
});

test.describe("tenant publish visibility", () => {
  test("draft releases stay hidden until published", async ({ page }) => {
    const slug = uniqueSlug("smoke-publish");
    const draftRelease = releasePayload({
      title: "Smoke Draft Visibility",
      version: `v${Date.now()}-draft`,
    });
    await signIn(page);
    const adminRequest = page.context().request;

    try {
      await seedTenant(adminRequest, slug);

      const createResponse = await adminRequest.post(
        `/api/tenant/${slug}/releases`,
        {
          data: draftRelease,
        },
      );
      expect(createResponse.status()).toBe(201);

      const createdRelease = (await createResponse.json()) as ReleasePayload;

      await expect((await page.goto(`/${slug}`))?.status()).toBe(200);
      await expect(page.getByText(draftRelease.title)).toHaveCount(0);

      const publishResponse = await adminRequest.put(
        `/api/tenant/${slug}/releases/${createdRelease.id}`,
        {
          data: {
            ...createdRelease,
            status: "published",
          },
        },
      );
      expect(publishResponse.status()).toBe(200);

      await expect((await page.goto(`/${slug}`))?.status()).toBe(200);
      await expect(page.getByText(draftRelease.title)).toBeVisible();
    } finally {
      await cleanupTenant(slug);
    }
  });
});

test.describe("private token access", () => {
  test("requires the correct private share token", async ({ page }) => {
    const slug = uniqueSlug("smoke-private");
    const shareToken = "known-private-smoke-token";
    const privateRelease = releasePayload({
      title: "Smoke Private Token Release",
      version: `v${Date.now()}-private`,
      status: "private",
      shareToken,
    });
    await signIn(page);
    const adminRequest = page.context().request;

    try {
      await seedTenant(adminRequest, slug);

      const createResponse = await adminRequest.post(
        `/api/tenant/${slug}/releases`,
        {
          data: privateRelease,
        },
      );
      expect(createResponse.status()).toBe(201);

      const path = `/${slug}/releases/${encodeURIComponent(privateRelease.version)}`;

      await expect((await page.goto(path))?.status()).toBe(404);
      await expect((await page.goto(`${path}?token=wrong`))?.status()).toBe(404);
      await expect(
        (await page.goto(`${path}?token=${shareToken}`))?.status(),
      ).toBe(200);
      await expect(page.getByText(privateRelease.title)).toBeVisible();
    } finally {
      await cleanupTenant(slug);
    }
  });
});
