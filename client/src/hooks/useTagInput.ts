import { useRef, useState, type KeyboardEvent, type RefObject } from "react";

interface UseTagInputOptions {
  maxTags: number;
  initialTags?: string[];
}

export interface UseTagInputResult {
  tags: string[];
  tagInput: string;
  setTagInput: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  handleKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handleRemoveTag: (tag: string) => void;
  focusInput: () => void;
}

export function useTagInput({
  maxTags,
  initialTags,
}: UseTagInputOptions): UseTagInputResult {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tags, setTags] = useState<string[]>(initialTags ?? []);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const value = tagInput.trim();
    if (!value || tags.includes(value) || tags.length >= maxTags) {
      setTagInput("");
      return;
    }
    setTags((current) => [...current, value]);
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setTags((current) => current.filter((existing) => existing !== tag));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag();
      return;
    }
    if (event.key === "Backspace" && tagInput === "" && tags.length > 0) {
      event.preventDefault();
      setTags((current) => current.slice(0, -1));
    }
  };

  const focusInput = () => inputRef.current?.focus();

  return { tags, tagInput, setTagInput, inputRef, handleKeyDown, handleRemoveTag, focusInput };
}
