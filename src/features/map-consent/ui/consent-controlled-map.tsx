"use client";

import { useEffect, useState } from "react";
import { Arrow } from "@/src/shared/ui/arrow";
import { MAP_CONSENT_CHANGE_EVENT, readMapConsent, writeMapConsent } from "@/src/shared/lib/privacy-consent";

export function ConsentControlledMap() {
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const syncConsent = () => setIsAllowed(readMapConsent());
    syncConsent();
    window.addEventListener(MAP_CONSENT_CHANGE_EVENT, syncConsent);
    return () => window.removeEventListener(MAP_CONSENT_CHANGE_EVENT, syncConsent);
  }, []);

  return (
    <section className={`yandex-map${isAllowed ? "" : " map-awaiting-consent"}`}>
      {isAllowed ? <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=37.572%2C55.747%2C37.585%2C55.755&layer=mapnik&marker=55.75109%2C37.578782" title="Расположение офиса Фасадной симфонии" loading="lazy" referrerPolicy="no-referrer" /> : <div className="map-consent"><span>Внешний сервис отключён</span><strong>Карта загрузится только с вашего согласия</strong><p>При загрузке OpenStreetMap сервису может быть передан ваш IP-адрес и техническая информация браузера</p><button type="button" onClick={() => writeMapConsent(true)}>Разрешить и показать карту</button></div>}
      <div className="map-card"><span>Наш офис</span><strong>Панфиловский переулок, 4</strong><a href="https://yandex.ru/maps/?text=Москва%2C%20Панфиловский%20переулок%2C%204" target="_blank" rel="noreferrer">Открыть в Яндекс Картах <Arrow /></a></div>
    </section>
  );
}
