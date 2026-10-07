"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { FileDropzone } from "./file-dropzone";

type PhotoUploadFormProps = {
  action: (form: FormData) => Promise<void>;
  maxFiles: number;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? "Добавляем…" : "Добавить фотографии"}</button>;
}

export function PhotoUploadForm({ action, maxFiles }: PhotoUploadFormProps) {
  const router = useRouter();
  const [dropzoneKey, setDropzoneKey] = useState(0);
  const [message, setMessage] = useState("");

  async function upload(form: FormData) {
    setMessage("Загружаем фотографии…");
    try {
      await action(form);
      setDropzoneKey((key) => key + 1);
      setMessage("Фотографии добавлены.");
      router.refresh();
    } catch {
      setMessage("Не удалось добавить фотографии. Проверьте размер и формат файлов.");
    }
  }

  return <>
    <form action={upload} className="admin-photo-upload">
      <FileDropzone key={dropzoneKey} name="images" label="Новые фотографии" multiple maxFiles={maxFiles} required />
      <SubmitButton />
    </form>
    {message && <p className="admin-upload-status" aria-live="polite">{message}</p>}
  </>;
}
