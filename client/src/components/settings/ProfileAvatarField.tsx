import { useRef, type ChangeEvent } from "react";
import { FiCamera, FiX } from "react-icons/fi";
import Avatar from "../ui/Avatar";
import ColorSwatchPicker from "../ui/ColorSwatchPicker";
import { AVATAR_COLORS } from "../../lib/avatarColors";

interface ProfileAvatarFieldProps {
  image: string | null;
  avatarColor: string;
  initials: string;
  onImageChange: (image: string | null) => void;
  onColorChange: (colorId: string) => void;
}

function ProfileAvatarField({
  image,
  avatarColor,
  initials,
  onImageChange,
  onColorChange,
}: ProfileAvatarFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedColor =
    AVATAR_COLORS.find((color) => color.id === avatarColor) ??
    AVATAR_COLORS[0];

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onImageChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onImageChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-muted">Avatar</p>
      <div className="flex items-end gap-4">
        <div className="relative">
          {image ? (
            <img
              src={image}
              alt="Avatar preview"
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <Avatar
              initials={initials}
              bgClass={selectedColor.bgClass}
              size="lg"
            />
          )}

          <button
            type="button"
            aria-label="Upload photo"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -right-1 -bottom-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <FiCamera className="h-4 w-4" />
          </button>

          {image && (
            <button
              type="button"
              aria-label="Remove photo"
              onClick={handleRemove}
              className="absolute -top-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted transition-colors hover:border-danger/40 hover:text-danger"
            >
              <FiX className="h-3.5 w-3.5" />
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-muted">
            Or pick a color
          </p>
          <ColorSwatchPicker value={avatarColor} onChange={onColorChange} />
        </div>
      </div>
    </div>
  );
}

export default ProfileAvatarField;
