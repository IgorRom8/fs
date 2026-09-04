"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
const links = [["/about", "О компании"], ["/portfolio", "Портфолио"], ["/news", "Новости"], ["/gallery", "Галерея"], ["/partners", "Партнёры"], ["/contacts", "Контакты"]];
export function MobileNavigation() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  return <><nav className={open ? "nav open" : "nav"} aria-label="Основная навигация"><span className="nav-caption">Навигация / 06</span>{links.map(([href, label], index) => <Link key={href} href={href} onClick={() => setOpen(false)}><small>0{index + 1}</small>{label}</Link>)}<span className="nav-footer">Фасадная симфония · Москва</span></nav><button className={open ? "menu active" : "menu"} onClick={() => setOpen(!open)} aria-label={open ? "Закрыть меню" : "Открыть меню"} aria-expanded={open}><span /><span /></button></>;
}
