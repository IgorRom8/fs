import { Brand } from "@/src/shared/ui/brand";
import { Arrow } from "@/src/shared/ui/arrow";
import { CookieSettingsButton } from "@/src/features/cookie-consent";

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
        </div>
        <div className="footer-column footer-column-center">
          <span className="footer-company">
            <span>ООО «Фасадная симфония»</span>
            <span>ИНН 7743479516</span>
          </span>
        </div>
        <div className="footer-column footer-column-right">
          <CookieSettingsButton />
        </div>
      </div>
    </footer>
  );
}
