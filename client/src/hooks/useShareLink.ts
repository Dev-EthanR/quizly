import { useState } from "react";

const COPIED_RESET_MS = 2000;

export function useShareLink() {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  return { copied, share };
}
