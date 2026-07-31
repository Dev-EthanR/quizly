import { Link } from "react-router-dom";
import { FiCompass } from "react-icons/fi";
import Button from "../components/ui/Button";
import FullScreenStatus from "../components/ui/FullScreenStatus";

function NotFound() {
  return (
    <FullScreenStatus
      tone="warning"
      icon={<FiCompass size={28} />}
      title="Page not found"
      message="The page you're looking for doesn't exist or may have moved."
    >
      <Link to="/" className="mt-2">
        <Button type="button">Back to Home</Button>
      </Link>
    </FullScreenStatus>
  );
}

export default NotFound;
