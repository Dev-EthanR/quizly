import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import Button from "../ui/Button";
import GoogleIcon from "../ui/GoogleIcon";
import { useAuth } from "../../context/useAuth";

interface GoogleConnectionCardProps {
  connected: boolean;
}

function GoogleConnectionCard({ connected }: GoogleConnectionCardProps) {
  const { signInWithGoogle } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleConnect = async () => {
    setIsRedirecting(true);
    try {
      await signInWithGoogle(`${window.location.origin}/settings`);
    } catch {
      setIsRedirecting(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-4 py-3">
      <div className="flex items-center gap-3">
        <GoogleIcon className="h-5 w-5" />
        <span className="font-medium text-foreground">Google</span>
      </div>

      {connected ? (
        <span className="flex items-center gap-1.5 rounded-full bg-secondary/15 px-3 py-1 text-sm font-semibold text-secondary">
          <FiCheck className="h-4 w-4" />
          Connected
        </span>
      ) : (
        <Button
          type="button"
          variant="secondary"
          onClick={() => void handleConnect()}
          disabled={isRedirecting}
        >
          {isRedirecting ? "Redirecting..." : "Connect"}
        </Button>
      )}
    </div>
  );
}

export default GoogleConnectionCard;
