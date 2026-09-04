import Image from "next/image";

type Props = { eyebrow: string; title: string; image: string; description?: string };
export function PageHero({ eyebrow, title, image, description }: Props) {
  return <section className="page-hero"><Image src={image} alt="" fill priority sizes="100vw" /><div className="page-hero-shade" /><div className="page-hero-number">SM / ARCHIVE</div><div className="page-hero-copy"><span>{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div><div className="page-hero-edge">Архитектура в деталях</div></section>;
}
