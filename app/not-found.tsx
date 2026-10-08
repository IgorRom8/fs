import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/src/widgets/page-shell";

export const metadata: Metadata = {
  title: "Страница не найдена",
  description: "Запрошенная страница не найдена.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <PageShell>
      <section className="content-section not-found-page">
        <span className="page-kicker">Ошибка 404</span>
        <h1>Страница не найдена</h1>
        <p>Возможно, адрес изменился или страница была удалена.</p>
        <Link className="pill dark" href="/">
          Вернуться на главную
        </Link>
      </section>
    </PageShell>
  );
}
