import { Arrow } from "@/src/shared/ui/arrow";

export function ContactForm() {
  return (
    <form className="contact-form" action="mailto:info@smtrud.ru" method="post" encType="text/plain">
      <label htmlFor="contact-email">Ваш email</label>
      <div className="contact-form-row">
        <input id="contact-email" name="email" type="email" placeholder="name@example.ru" autoComplete="email" required />
        <button type="submit" aria-label="Отправить email">
          <span>Отправить</span>
          <Arrow />
        </button>
      </div>
      <label className="contact-consent">
        <input name="personal-data-consent" type="checkbox" required />
        <span>Я даю <a href="/personal-data-consent" target="_blank" rel="noreferrer">согласие на обработку персональных данных</a> и ознакомлен с <a href="/privacy" target="_blank" rel="noreferrer">политикой обработки персональных данных</a></span>
      </label>
      <small>Нажимая кнопку, вы создадите письмо для нашей команды</small>
    </form>
  );
}
