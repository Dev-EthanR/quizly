import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="cursor-pointer rounded-lg border border-border bg-background p-2 text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiChevronLeft className="size-5" />
      </button>

      <span className="text-sm text-muted">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="cursor-pointer rounded-lg border border-border bg-background p-2 text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiChevronRight className="size-5" />
      </button>
    </div>
  );
}

export default Pagination;
