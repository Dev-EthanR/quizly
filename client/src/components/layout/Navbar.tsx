import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import clsx from "clsx";
import AvatarMenu from "./AvatarMenu";

interface NavItem {
  label: string;
  to: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Discovery", to: "/discovery" },
  { label: "My Quizzes", to: "/my-quizzes" },
  { label: "Dashboard", to: "/host" },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    isActive ? "text-primary" : "text-muted hover:text-foreground",
  );

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="shrink-0 text-xl font-bold text-foreground">
          Quiz<span className="text-primary">zly</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <Link
            to="/"
            className="rounded-lg border border-border px-3 py-2 text-sm font-semibold whitespace-nowrap text-foreground transition-colors hover:bg-background"
          >
            Join a game
          </Link>

          <AvatarMenu />

          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex cursor-pointer flex-col justify-center gap-1.5 rounded-lg p-2 hover:bg-background md:hidden"
          >
            <span className="h-0.5 w-5 bg-foreground" />
            <span className="h-0.5 w-5 bg-foreground" />
            <span className="h-0.5 w-5 bg-foreground" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-border px-4 py-2 md:hidden">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={navLinkClass}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}

export default Navbar;
