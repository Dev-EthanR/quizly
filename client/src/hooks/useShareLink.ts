import { useCopyToClipboard } from "./useCopyToClipboard";

export function useShareLink() {
  const { copied, copy } = useCopyToClipboard();

  const share = () => copy(window.location.href);

  return { copied, share };
}
