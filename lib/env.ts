import "server-only";

import { z } from "zod";

const envSchema = z.object({
  ADMIN_PASSWORD: z
    .string()
    .min(8, "ADMIN_PASSWORD must be at least 8 characters."),
  NEXTAUTH_SECRET: z
    .string()
    .min(16, "NEXTAUTH_SECRET must be at least 16 characters."),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_TENANT_API: z.enum(["true", "false"]).default("false"),
  RESEND_API_KEY: z.string().startsWith("re_").optional(),
});

export const env = (() => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error(
      "❌ Invalid environment variables:\n",
      result.error.issues
        .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
        .join("\n"),
    );
    process.exit(1);
  }

  return result.data;
})();
