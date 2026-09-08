import type { ReactNode } from "react";
export const metadata = { title: "Панель управления", robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: ReactNode }) { return children; }
