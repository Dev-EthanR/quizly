import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthModeTabs, { type AuthMode } from "../components/auth/AuthModeTabs";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";
import SignInForm from "../components/auth/SignInForm";
import SignUpForm from "../components/auth/SignUpForm";

const HOST_PATH = "/host";

interface SignInLocation {
  state?: {
    mode?: AuthMode;
  };
}

function SignIn() {
  const navigate = useNavigate();
  const { state } = useLocation() as SignInLocation;
  const [mode, setMode] = useState<AuthMode>(state?.mode ?? "signin");
  const [formError, setFormError] = useState<string | null>(null);

  const callbackUrl = `${window.location.origin}${HOST_PATH}`;

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setFormError(null);
  };

  const handleSuccess = () => navigate(HOST_PATH, { replace: true });

  return (
    <div className="page-shell flex flex-col items-center justify-center gap-6 px-4">
      <h1 className="heading text-4xl">
        Quiz<span className="text-primary">zly</span>
      </h1>

      <div className="card flex w-full max-w-sm flex-col gap-4 p-6">
        <AuthModeTabs mode={mode} onChange={switchMode} />

        <div className="text-center">
          <h2 className="heading text-2xl">
            {mode === "signin" ? "Welcome back" : "Create an account"}
          </h2>
          <p className="mt-1 text-muted">
            {mode === "signin"
              ? "Sign in to host and manage your quizzes"
              : "Sign up to start hosting your own quizzes"}
          </p>
        </div>

        <GoogleSignInButton callbackUrl={callbackUrl} />

        <div className="flex items-center gap-3">
          <div className="divider flex-1" />
          <span className="text-sm text-muted">or</span>
          <div className="divider flex-1" />
        </div>

        {formError && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-center text-sm text-danger">
            {formError}
          </p>
        )}

        {mode === "signin" ? (
          <SignInForm
            callbackUrl={callbackUrl}
            onSuccess={handleSuccess}
            onError={setFormError}
          />
        ) : (
          <SignUpForm
            callbackUrl={callbackUrl}
            onSuccess={handleSuccess}
            onError={setFormError}
          />
        )}
      </div>
    </div>
  );
}

export default SignIn;
