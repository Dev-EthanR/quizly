import type { ReactNode } from "react";
import Button from "./Button";

interface ErrorRetryProps {
  message: string;
  onRetry: () => void;
  children?: ReactNode;
}

function ErrorRetry({ message, onRetry, children }: ErrorRetryProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <p className="text-danger">{message}</p>
      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
        {children}
      </div>
    </div>
  );
}

export default ErrorRetry;
