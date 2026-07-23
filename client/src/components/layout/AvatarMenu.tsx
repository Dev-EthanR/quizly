import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import Avatar from "../ui/Avatar";
import { useAuth } from "../../context/useAuth";
import { getInitials } from "../../lib/initials";

function AvatarMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex cursor-pointer rounded-full"
      >
        <Avatar
          initials={getInitials(user?.name ?? user?.email ?? "")}
          bgClass="bg-primary"
        />
      </button>

      <div
        role="menu"
        className={clsx(
          "absolute top-full right-0 z-20 mt-2 w-44 flex-col gap-1 rounded-lg border border-border bg-surface p-1 shadow-lg",
          open ? "flex" : "hidden",
        )}
      >
        <Link
          to="/settings"
          role="menuitem"
          onClick={() => setOpen(false)}
          className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-background"
        >
          Settings
        </Link>
        <button
          type="button"
          role="menuitem"
          onClick={() => void handleSignOut()}
          className="cursor-pointer rounded-md px-3 py-2 text-left text-sm font-medium text-danger hover:bg-background"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export default AvatarMenu;
