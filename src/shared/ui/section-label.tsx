type Props = { index: string; children: React.ReactNode; light?: boolean };
export function SectionLabel({ index, children, light = false }: Props) { return <div className={`section-label${light ? " light" : ""}`} data-reveal><span>{index}</span>{children}</div>; }
