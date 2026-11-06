export default function DiyaIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="diyaBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="55%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <radialGradient id="diyaFlame" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#fff7ed" />
          <stop offset="45%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f97316" />
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="48" rx="22" ry="8" fill="url(#diyaBody)" />
      <path
        d="M12 46c2-10 10-16 20-16s18 6 20 16c-4 4-12 6-20 6s-16-2-20-6z"
        fill="url(#diyaBody)"
      />
      <ellipse cx="32" cy="42" rx="10" ry="3.5" fill="#92400e" opacity="0.55" />
      <path
        d="M32 14c4 6 5 10 5 14 0 4-2.2 7-5 7s-5-3-5-7c0-4 1-8 5-14z"
        fill="url(#diyaFlame)"
      />
      <circle cx="32" cy="28" r="2.2" fill="#fff7ed" />
    </svg>
  );
}
