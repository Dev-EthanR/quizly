import type { UseTagInputResult } from "../../../hooks/useTagInput";

interface TagsInputProps {
  state: UseTagInputResult;
  maxTags: number;
  error?: string;
}

function TagsInput({ state, maxTags, error }: TagsInputProps) {
  const { tags, tagInput, setTagInput, inputRef, handleKeyDown, handleRemoveTag, focusInput } =
    state;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="quiz-tags" className="text-sm font-medium text-muted">
        Tags
      </label>
      <div
        onClick={focusInput}
        className="flex cursor-text flex-wrap items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary"
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-semibold text-primary"
          >
            #{tag}
            <button
              type="button"
              aria-label={`Remove tag ${tag}`}
              onClick={(event) => {
                event.stopPropagation();
                handleRemoveTag(tag);
              }}
              className="cursor-pointer text-primary hover:text-foreground"
            >
              ✕
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id="quiz-tags"
          value={tagInput}
          onChange={(event) => setTagInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Type a tag and press Enter" : ""}
          disabled={tags.length >= maxTags}
          className="min-w-32 flex-1 bg-transparent py-1 text-sm text-foreground placeholder:text-muted focus:outline-none"
        />
      </div>
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}

export default TagsInput;
