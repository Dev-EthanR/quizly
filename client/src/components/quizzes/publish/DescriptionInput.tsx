interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const MAX_DESCRIPTION_LENGTH = 500;

function DescriptionInput({ value, onChange, error }: DescriptionInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="quiz-description" className="text-sm font-medium text-muted">
        Description
      </label>
      <textarea
        id="quiz-description"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={MAX_DESCRIPTION_LENGTH}
        rows={3}
        placeholder="What's this quiz about?"
        className="resize-none rounded-lg border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="flex items-center justify-between">
        {error ? (
          <span className="text-sm text-danger">{error}</span>
        ) : (
          <span />
        )}
        <span className="text-xs text-muted">
          {value.length}/{MAX_DESCRIPTION_LENGTH}
        </span>
      </div>
    </div>
  );
}

export default DescriptionInput;
