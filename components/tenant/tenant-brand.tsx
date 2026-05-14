import Image from "next/image";
import type { TenantIdentity } from "@/lib/types";

type TenantBrandMarkProps = {
  fetchPriority?: "high" | "low" | "auto";
  identity: TenantIdentity;
};

export function TenantBrandMark({
  fetchPriority,
  identity,
}: TenantBrandMarkProps) {
  if (identity.logoUrl) {
    return (
      <Image
        alt={identity.brandName}
        fetchPriority={fetchPriority}
        className="max-h-7 max-w-[min(12rem,58vw)] object-contain"
        height={28}
        src={identity.logoUrl}
        style={{ width: "auto", height: 28 }}
        sizes="140px"
        unoptimized
        width={140}
      />
    );
  }

  return (
    <span className="block max-w-[min(14rem,58vw)] truncate text-[15px] font-semibold sm:max-w-none">
      {identity.brandName}
    </span>
  );
}
