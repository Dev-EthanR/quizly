import ColorSwatchPicker from "./ColorSwatchPicker";
import Avatar from "./Avatar";
import { AVATAR_COLORS } from "../../lib/avatarColors";

interface AvatarColorFieldProps {
  value: string;
  onChange: (colorId: string) => void;
  initials: string;
}

function AvatarColorField({
  value,
  onChange,
  initials,
}: AvatarColorFieldProps) {
  const selectedColor =
    AVATAR_COLORS.find((color) => color.id === value) ?? AVATAR_COLORS[0];

  return (
    <div>
      <p className="field-label mb-2">Pick your color</p>
      <div className="flex items-end gap-3">
        <ColorSwatchPicker value={value} onChange={onChange} />
        <Avatar initials={initials} bgClass={selectedColor.bgClass} />
      </div>
    </div>
  );
}

export default AvatarColorField;
