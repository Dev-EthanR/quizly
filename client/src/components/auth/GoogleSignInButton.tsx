import { useState } from "react";
import Button from "../ui/Button";
import GoogleIcon from "../ui/GoogleIcon";
import { useAuth } from "../../context/useAuth";

interface GoogleSignInButtonProps {
  callbackUrl: string;
}

function GoogleSignInButton({ callbackUrl }: GoogleSignInButtonProps) {
  const { signInWithGoogle } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleClick = async () => {
    setIsRedirecting(true);
    try {
      await signInWithGoogle(callbackUrl);
    } catch {
      setIsRedirecting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleClick}
      disabled={isRedirecting}
      className="flex items-center justify-center gap-2"
    >
      <GoogleIcon className="h-5 w-5" />
      {isRedirecting ? "Redirecting..." : "Continue with Google"}
    </Button>
  );
}

export default GoogleSignInButton;
