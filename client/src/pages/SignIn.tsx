import { useState } from "react";
import { useLocation } from "react-router-dom";
import clsx from "clsx";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import GoogleIcon from "../components/ui/GoogleIcon";
import { useAuth } from "../context/useAuth";

interface SignInLocationState {
  state?: {
    from?: string;
  };
}

type AuthMode = "signin" | "signup";

function SignIn() {
  const { signInWithGoogle } = useAuth();
  const { state } = useLocation() as SignInLocationState;
  const [mode, setMode] = useState<AuthMode>("signin");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const redirectPath = state?.from ?? "/host";
  const callbackUrl = `${window.location.origin}${redirectPath}`;

  const handleGoogleSignIn = async () => {
    setIsRedirecting(true);
    try {
      await signInWithGoogle(callbackUrl);
    } catch {
      setIsRedirecting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-4xl font-bold text-foreground">
        Quiz<span className="text-primary">zly</span>
      </h1>

      <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-surface p-6">
        <div className="flex rounded-lg border border-border p-1">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={clsx(
              "flex-1 cursor-pointer rounded-md py-2 text-sm font-semibold transition-colors",
              mode === "signin"
                ? "bg-primary text-foreground"
                : "text-muted hover:text-foreground",
            )}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={clsx(
              "flex-1 cursor-pointer rounded-md py-2 text-sm font-semibold transition-colors",
              mode === "signup"
                ? "bg-primary text-foreground"
                : "text-muted hover:text-foreground",
            )}
          >
            Sign up
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">
            {mode === "signin" ? "Welcome back" : "Create an account"}
          </h2>
          <p className="mt-1 text-muted">
            {mode === "signin"
              ? "Sign in to host and manage your quizzes"
              : "Sign up to start hosting your own quizzes"}
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={handleGoogleSignIn}
          disabled={isRedirecting}
          className="flex items-center justify-center gap-2"
        >
          <GoogleIcon className="h-5 w-5" />
          {isRedirecting ? "Redirecting..." : "Continue with Google"}
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-muted">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <fieldset disabled className="flex flex-col gap-4 opacity-50">
          {mode === "signup" && (
            <Input label="Username" placeholder="NovaFox" maxLength={20} />
          )}
          <Input label="Email" type="email" placeholder="you@example.com" />
          <Input label="Password" type="password" placeholder="********" />
          <Button type="submit" variant="secondary">
            {mode === "signin" ? "Sign in" : "Sign up"} with email
          </Button>
        </fieldset>
        <p className="text-center text-xs text-muted">
          Email {mode === "signin" ? "sign-in" : "sign-up"} is coming soon
        </p>
      </div>
    </div>
  );
}

export default SignIn;
