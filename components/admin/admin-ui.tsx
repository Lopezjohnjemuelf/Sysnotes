type AdminSegmentedControlProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  getLabel?: (value: T) => string;
};

export function getAdminSegmentButtonClass(isActive: boolean) {
  return isActive
    ? "rounded-md border border-[var(--accent-bg)] bg-[var(--accent-bg)] px-3 py-2 text-left text-sm font-semibold text-[var(--accent-text)]"
    : "rounded-md border border-[var(--admin-input-border)] bg-[var(--surface-card)] px-3 py-2 text-left text-sm font-semibold text-[var(--text-muted-4)] transition hover:bg-[var(--surface-hover,var(--tag-bg))]";
}

export function AdminSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  getLabel = (option) => option,
}: AdminSegmentedControlProps<T>) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => (
        <button
          className={getAdminSegmentButtonClass(value === option)}
          key={option}
          onClick={() => onChange(option)}
          type="button"
        >
          {getLabel(option)}
        </button>
      ))}
    </div>
  );
}
