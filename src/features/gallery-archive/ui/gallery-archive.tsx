"use client";

import Image from "next/image";
import { useState } from "react";

export function GalleryArchive({ images }: { images: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <section className={`gallery-archive ${open ? "is-open" : ""}`}>
      <button className="archive-folder" type="button" aria-expanded={open} aria-controls="gallery-2026" onClick={() => setOpen((value) => !value)}>
        <span className="archive-label">Фотоархив</span>
        <strong>2026</strong>
        <span className="archive-meta">{images.length} фотографий</span>
        <span className="archive-toggle" aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <div className="archive-reveal" id="gallery-2026">
        <div className="archive-reveal-inner">
          <div className="masonry content-section">
            {images.map((image, index) => (
              <div className={`masonry-item item-${index % 4}`} key={`${image}-${index}`}>
                <Image src={image} alt={`Фасадные работы в 2026 году, фото ${index + 1}`} fill sizes="(max-width:700px) 100vw, 50vw" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
