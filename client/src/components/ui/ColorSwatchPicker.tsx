import clsx from "clsx";
import { AVATAR_COLORS } from "../../lib/avatarColors";

interface ColorSwatchPickerProps {
  value: string;
  onChange: (colorId: string) => void;
}

function ColorSwatchPicker({ value, onChange }: ColorSwatchPickerProps) {
  return (
    <div className="flex flex-nowrap gap-1.5 sm:gap-2">
      {AVATAR_COLORS.map((color) => (
        <button
          key={color.id}
          type="button"
          aria-label={`${color.id} avatar color`}
          aria-pressed={value === color.id}
          onClick={() => onChange(color.id)}
          className={clsx(
            "h-7 w-7 sm:h-8 sm:w-8 shrink-0 cursor-pointer rounded-full transition-shadow",
            color.bgClass,
            value === color.id &&
              "ring-2 ring-foreground ring-offset-2 ring-offset-surface",
          )}
        />
      ))}
    </div>
  );
}

export default ColorSwatchPicker;
