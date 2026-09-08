export function Brand() {
  return (
    <span className="brand">
      <svg className="brand-symbol" viewBox="0 0 300 58" role="img" aria-label="Фасадная симфония">
        <g className="brand-sign" fill="none" strokeLinecap="square" strokeLinejoin="miter">
          <path className="brand-sign-accent" d="M4 4v50h64" strokeWidth="3" />
          <path className="brand-sign-outline" d="M13 4h38v17c0 14 5 24 17 33H13V4Z" strokeWidth="2.4" />
          <path className="brand-sign-grid" d="M14 12h37M14 21h37M14 30h37M14 39h40M14 47h46" strokeWidth="1.15" />
          <path className="brand-sign-grid" d="M25 4v8M39 12v9M22 21v9M37 30v9M27 39v8M47 39v8" strokeWidth="1.15" />
        </g>
        <g className="brand-wordmark" fill="currentColor">
          <text x="84" y="26" fontFamily="Manrope, Arial, sans-serif" fontSize="17" fontWeight="600" letterSpacing=".7">ФАСАДНАЯ</text>
          <text x="84" y="46" fontFamily="Manrope, Arial, sans-serif" fontSize="17" fontWeight="400" letterSpacing="2.15">СИМФОНИЯ</text>
        </g>
      </svg>
    </span>
  );
}
