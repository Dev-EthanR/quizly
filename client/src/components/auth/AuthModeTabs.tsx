import clsx from "clsx";

export type AuthMode = "signin" | "signup";

interface AuthModeTabsProps {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
}

function AuthModeTabs({ mode, onChange }: AuthModeTabsProps) {
  return (
    <div className="flex rounded-lg border border-border p-1">
      <button
        type="button"
        onClick={() => onChange("signin")}
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
        onClick={() => onChange("signup")}
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
  );
}

export default AuthModeTabs;
