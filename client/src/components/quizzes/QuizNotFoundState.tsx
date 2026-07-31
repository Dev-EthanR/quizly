import { Link } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import Button from "../ui/Button";

function QuizNotFoundState() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-danger/40 bg-danger/10 text-danger">
        <FiAlertTriangle size={28} />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Quiz not found</h1>
      <p className="text-muted">
        This quiz may have been unpublished or made private.
      </p>
      <Link to="/discovery" className="mt-2">
        <Button type="button">Back to Discovery</Button>
      </Link>
    </div>
  );
}

export default QuizNotFoundState;
