import { Footer } from "@/src/widgets/footer";
import { Header } from "@/src/widgets/header";

export function PageShell({ children }: { children: React.ReactNode }) {
  return <main id="top" className="inner-page"><div className="inner-header"><Header /></div>{children}<Footer /></main>;
}
