import { Brand } from "@/src/shared/ui/brand";
import { Arrow } from "@/src/shared/ui/arrow";
import Link from "next/link";
import { CookieSettingsButton } from "@/src/shared/ui/cookie-settings-button";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <Brand />
        <p>Фасадные решения<br />для архитектуры города</p>
        <a className="footer-up" href="#top">Наверх <Arrow /></a>
      </div>

      <div className="footer-bottom">
        <div className="footer-column footer-column-left">
          <p>© 2026 Все права защищены</p>
          <Link href="/personal-data-consent">Согласие на обработку данных</Link>
        </div>
        <div className="footer-column footer-column-center">
          <span className="footer-company">
            <span>ООО «Фасадная симфония»</span>
            <span>ИНН 7743479516</span>
          </span>
          <CookieSettingsButton />
        </div>
        <div className="footer-column footer-column-right">
          <Link href="/privacy">Политика обработки персональных данных</Link>
        </div>
      </div>
    </footer>
  );
}
