import {
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type MouseEvent,
  type RefObject,
} from "react";

export interface UseCoverImageDropzoneResult {
  coverImage: string | undefined;
  isDragOver: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  openFilePicker: () => void;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (event: DragEvent<HTMLDivElement>) => void;
  handleDragOver: (event: DragEvent<HTMLDivElement>) => void;
  handleDragLeave: () => void;
  handleRemove: (event: MouseEvent<HTMLButtonElement>) => void;
}

interface UseCoverImageDropzoneOptions {
  initialCoverImage?: string;
}

export function useCoverImageDropzone({
  initialCoverImage,
}: UseCoverImageDropzoneOptions = {}): UseCoverImageDropzoneResult {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverImage, setCoverImage] = useState<string | undefined>(
    initialCoverImage,
  );
  const [isDragOver, setIsDragOver] = useState(false);

  const readFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setCoverImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    readFile(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    readFile(event.dataTransfer.files[0]);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleRemove = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setCoverImage(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return {
    coverImage,
    isDragOver,
    fileInputRef,
    openFilePicker,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleRemove,
  };
}
