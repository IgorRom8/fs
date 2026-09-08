"use client";

import Image from "next/image";
import { useState } from "react";

type Album = { id: string; title: string; year: number; images: { src: string; alt: string }[] };
export function GalleryArchive({ albums }: { albums: Album[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>{albums.map(album => <section className={`gallery-archive ${open === album.id ? "is-open" : ""}`} key={album.id}>
      <button className="archive-folder" type="button" aria-expanded={open === album.id} aria-controls={`gallery-${album.id}`} onClick={() => setOpen(value => value === album.id ? null : album.id)}>
        <span className="archive-label">Фотоархив</span>
        <strong>{album.year}</strong>
        <span className="archive-meta">{album.title} · {album.images.length} фотографий</span>
        <span className="archive-toggle" aria-hidden="true">{open === album.id ? "−" : "+"}</span>
      </button>
      <div className="archive-reveal" id={`gallery-${album.id}`}>
        <div className="archive-reveal-inner">
          <div className="masonry content-section">
            {album.images.map((image, index) => (
              <div className={`masonry-item item-${index % 4}`} key={image.src}>
                <Image src={image.src} alt={image.alt || `${album.title}, фото ${index + 1}`} fill sizes="(max-width:700px) 100vw, 50vw" unoptimized />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>)}</>
  );
}
