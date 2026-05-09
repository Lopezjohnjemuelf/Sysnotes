export class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotImplementedError";
  }
}

export function shouldUseTenantApi() {
  return process.env.NEXT_PUBLIC_TENANT_API === "true";
}
