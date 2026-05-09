import type { TenantIdentity } from "@/lib/types";

type TenantBrandMarkProps = {
  identity: TenantIdentity;
};

export function TenantBrandMark({ identity }: TenantBrandMarkProps) {
  if (identity.logoUrl) {
    return (
      <img
        alt={identity.brandName}
        className="max-h-7 max-w-[min(12rem,58vw)] object-contain"
        height={28}
        src={identity.logoUrl}
        style={{ width: "auto" }}
      />
    );
  }

  return (
    <span className="block max-w-[min(14rem,58vw)] truncate text-[15px] font-semibold sm:max-w-none">
      {identity.brandName}
    </span>
  );
}
