import clsx from "clsx";

interface PillTabOption<T extends string> {
  value: T;
  label: string;
}

interface PillTabsProps<T extends string> {
  options: PillTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

function PillTabs<T extends string>({
  options,
  value,
  onChange,
}: PillTabsProps<T>) {
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={clsx(
            "cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
            value === option.value
              ? "bg-primary text-foreground"
              : "border border-border text-muted hover:bg-surface",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default PillTabs;
