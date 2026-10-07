"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import type { DragEvent } from "react";
import styles from "./sortable-photo-grid.module.css";

type Photo = { id: string; src: string; alt: string };
type SortablePhotoGridProps = {
  photos: Photo[];
  saveOrder: (ids: string[]) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
};

export function SortablePhotoGrid({ photos, saveOrder, deletePhoto }: SortablePhotoGridProps) {
  const [items, setItems] = useState(photos);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [message, setMessage] = useState("Перетащите фотографии, чтобы изменить порядок на сайте.");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setItems(photos);
  }, [photos]);

  function persist(next: Photo[]) {
    setItems(next);
    setMessage("Сохраняем порядок…");
    startTransition(async () => {
      try {
        await saveOrder(next.map((item) => item.id));
        setMessage("Порядок сохранён.");
      } catch {
        setItems(items);
        setMessage("Не удалось сохранить порядок. Попробуйте ещё раз.");
      }
    });
  }

  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= items.length || isPending) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    persist(next);
  }

  function drop(event: DragEvent<HTMLElement>, targetId: string) {
    event.preventDefault();
    const sourceIndex = items.findIndex((item) => item.id === draggedId);
    const targetIndex = items.findIndex((item) => item.id === targetId);
    setDraggedId(null);
    setOverId(null);
    move(sourceIndex, targetIndex);
  }

  function remove(id: string) {
    if (isPending || !window.confirm("Удалить эту фотографию?")) return;
    const previous = items;
    setItems((current) => current.filter((item) => item.id !== id));
    setMessage("Удаляем фотографию…");
    startTransition(async () => {
      try {
        await deletePhoto(id);
        setMessage("Фотография удалена.");
      } catch {
        setItems(previous);
        setMessage("Не удалось удалить фотографию.");
      }
    });
  }

  return <div className={styles.root}>
    <p className={styles.status} aria-live="polite">{isPending ? "Сохраняем изменения…" : message}</p>
    <div className={styles.grid}>
      {items.map((photo, index) => <article
        className={`${styles.card}${draggedId === photo.id ? ` ${styles.dragging}` : ""}${overId === photo.id ? ` ${styles.dragOver}` : ""}`}
        draggable={!isPending}
        key={photo.id}
        onDragStart={() => setDraggedId(photo.id)}
        onDragEnd={() => { setDraggedId(null); setOverId(null); }}
        onDragOver={(event) => { event.preventDefault(); setOverId(photo.id); }}
        onDragLeave={() => setOverId(null)}
        onDrop={(event) => drop(event, photo.id)}
      >
        <span className={styles.position}>{index + 1}</span>
        <div className={styles.image}><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) 50vw, 240px" unoptimized /></div>
        <div className={styles.caption}>
          <strong>Фото {String(index + 1).padStart(2, "0")}</strong>
          <div className={styles.actions}>
            <button type="button" disabled={index === 0 || isPending} onClick={() => move(index, index - 1)} aria-label="Переместить фотографию выше">↑</button>
            <button type="button" disabled={index === items.length - 1 || isPending} onClick={() => move(index, index + 1)} aria-label="Переместить фотографию ниже">↓</button>
            <button className={styles.delete} type="button" disabled={isPending} onClick={() => remove(photo.id)} aria-label="Удалить фотографию">×</button>
          </div>
        </div>
      </article>)}
    </div>
  </div>;
}
