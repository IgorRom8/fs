import { MobileNavigation } from "@/src/features/mobile-navigation/ui/mobile-navigation";
import { Arrow } from "@/src/shared/ui/arrow";
import { Brand } from "@/src/shared/ui/brand";
import Link from "next/link";
export function Header() { return <header className="header"><Link href="/" aria-label="Фасадная симфония — на главную"><Brand /></Link><MobileNavigation /><Link className="header-cta" href="/contacts">Обсудить проект <Arrow /></Link></header>; }
