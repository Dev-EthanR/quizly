import type { UseTagInputResult } from "../../../hooks/useTagInput";
import TagPill from "../../ui/TagPill";

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
      <label htmlFor="quiz-tags" className="field-label">
        Tags
      </label>
      <div
        onClick={focusInput}
        className="flex cursor-text flex-wrap items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary"
      >
        {tags.map((tag) => (
          <TagPill key={tag} tag={tag} onRemove={() => handleRemoveTag(tag)} />
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
