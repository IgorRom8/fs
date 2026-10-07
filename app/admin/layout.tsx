import type { Metadata } from "next";
import type { ReactNode } from "react";
import styles from "./admin.module.css";
export const metadata: Metadata = { title: "Панель управления", robots: { index: false, follow: false, noarchive: true } };
export default function AdminLayout({ children }: { children: ReactNode }) { return <div className={styles.scope}>{children}</div>; }
