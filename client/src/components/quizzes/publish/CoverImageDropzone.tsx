import clsx from "clsx";
import { FiX } from "react-icons/fi";
import type { UseCoverImageDropzoneResult } from "../../../hooks/useCoverImageDropzone";

interface CoverImageDropzoneProps {
  dropzone: UseCoverImageDropzoneResult;
}

function CoverImageDropzone({ dropzone }: CoverImageDropzoneProps) {
  const {
    coverImage,
    isDragOver,
    fileInputRef,
    openFilePicker,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleRemove,
  } = dropzone;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-muted">Cover thumbnail</span>
      <div
        role="button"
        tabIndex={0}
        onClick={openFilePicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFilePicker();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={clsx(
          "relative flex h-24 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors",
          isDragOver
            ? "border-primary bg-primary/10"
            : "border-border bg-background hover:border-primary/40",
        )}
      >
        {coverImage ? (
          <>
            <img
              src={coverImage}
              alt="Cover preview"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              aria-label="Remove cover image"
              onClick={handleRemove}
              className="absolute top-2 right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-background/80 text-foreground transition-colors hover:border-danger/40 hover:text-danger"
            >
              <FiX className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-sm font-medium text-muted">
              Click or drag an image here
            </span>
            <span className="text-xs text-muted">16:9 recommended</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default CoverImageDropzone;
