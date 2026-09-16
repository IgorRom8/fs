import type { ReactNode } from "react";
import styles from "./admin.module.css";
export const metadata = { title: "Панель управления", robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: ReactNode }) { return <div className={styles.scope}>{children}</div>; }
