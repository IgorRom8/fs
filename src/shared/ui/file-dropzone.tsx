"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, DragEvent } from "react";

const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];

type FileDropzoneProps = { name: string; label: string; multiple?: boolean; required?: boolean; maxFiles?: number };

export function FileDropzone({ name, label, multiple = false, required = false, maxFiles = 1 }: FileDropzoneProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url)), []);

  function applyFiles(incoming: File[]) {
    const combined = multiple ? [...files, ...incoming] : incoming;
    const unique = combined.filter((file, index, list) => list.findIndex(candidate => candidate.name === file.name && candidate.size === file.size && candidate.lastModified === file.lastModified) === index);
    const candidates = unique.filter((file) => acceptedTypes.includes(file.type) && file.size <= 4_000_000).slice(0, multiple ? maxFiles : 1);
    const valid = candidates.filter((file, index) => candidates.slice(0, index + 1).reduce((total, item) => total + item.size, 0) <= 30_000_000);
    if (!inputRef.current || valid.length === 0) return;
    const transfer = new DataTransfer();
    valid.forEach((file) => transfer.items.add(file));
    inputRef.current.files = transfer.files;
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    const nextPreviewUrls = valid.map((file) => URL.createObjectURL(file));
    previewUrlsRef.current = nextPreviewUrls;
    setPreviewUrls(nextPreviewUrls);
    setFiles(valid);
  }

  function drop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    applyFiles(Array.from(event.dataTransfer.files));
  }

  return <div className="admin-upload-field">
    <span>{label}</span>
    <label className={`admin-dropzone${dragging ? " is-dragging" : ""}${files.length ? " has-files" : ""}`} htmlFor={id} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={drop}>
      <input ref={inputRef} id={id} name={name} type="file" multiple={multiple} required={required} accept={acceptedTypes.join(",")} onChange={(event) => applyFiles(Array.from(event.target.files ?? []))} />
      {previewUrls.length > 0 && <span className={`admin-dropzone-previews${multiple ? " is-multiple" : ""}`} aria-hidden="true">{previewUrls.slice(0, 8).map((url, index) => <img src={url} alt="" key={url} style={{ "--preview-index": index } as CSSProperties} />)}</span>}
      {!files.length && <span className="admin-dropzone-icon" aria-hidden="true"><i /><i /></span>}
      <span className="admin-dropzone-copy">
        <strong>{files.length ? (multiple ? `Выбрано файлов: ${files.length}` : files[0].name) : "Перетащите изображение сюда"}</strong>
        <small>{files.length ? (multiple ? `Можно добавить ещё одной пачкой · максимум ${maxFiles}` : "Нажмите или перетащите другой файл, чтобы заменить") : `или нажмите, чтобы выбрать${multiple ? ` до ${maxFiles} файлов` : " файл"}`}</small>
        {!files.length && <em>JPEG · PNG · WEBP · AVIF / до 4 МБ файл · до 30 МБ за раз</em>}
      </span>
    </label>
  </div>;
}
