import clsx from "clsx";
import { useQuizCategories } from "../../../hooks/useQuizCategories";

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function CategorySelect({ value, onChange, error }: CategorySelectProps) {
  const categoriesQuery = useQuizCategories();

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="quiz-category" className="text-sm font-medium text-muted">
        Category
      </label>
      <select
        id="quiz-category"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={categoriesQuery.isLoading}
        className={clsx(
          "rounded-lg border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary",
          error ? "border-danger" : "border-border",
        )}
      >
        <option value="">
          {categoriesQuery.isLoading ? "Loading categories..." : "Select a category"}
        </option>
        {categoriesQuery.data?.map((option) => (
          <option key={option.id} value={option.name}>
            {option.name}
          </option>
        ))}
      </select>

      {categoriesQuery.isError && (
        <p className="text-sm text-danger">
          Couldn't load categories.{" "}
          <button
            type="button"
            onClick={() => categoriesQuery.refetch()}
            className="cursor-pointer font-semibold underline"
          >
            Retry
          </button>
        </p>
      )}
      {!categoriesQuery.isLoading &&
        !categoriesQuery.isError &&
        categoriesQuery.data?.length === 0 && (
          <p className="text-sm text-muted">No categories available yet.</p>
        )}
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}

export default CategorySelect;
