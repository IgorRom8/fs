import Image from "next/image";

export function Brand() {
  return <span className="brand"><Image className="brand-logo" src="/logo.png" width={136} height={72} alt="Фасадная симфония" priority /></span>;
}
