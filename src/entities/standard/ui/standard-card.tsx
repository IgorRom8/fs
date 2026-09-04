import type { Standard } from "../model/standards";
export function StandardCard({ standard, index }: { standard: Standard; index: number }) { return <article data-reveal><span>0{index + 1}</span><div><h3>{standard.title}</h3><p>{standard.description}</p></div></article>; }
