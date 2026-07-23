import { Link } from 'react-router-dom';

export default function Button({
  children,
  variant = 'primary',
  href,
  className = '',
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-60';

  const variants = {
    primary:
      'bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(59,130,246,0.35)]',
    secondary:
      'bg-white text-ink shadow-[0_4px_20px_rgba(15,23,42,0.08)] border border-slate-100 hover:shadow-md',
    outline: 'border border-brand text-brand hover:bg-brand-light',
    ghost: 'text-brand hover:bg-brand-light',
  };

  const classes = `${base} ${variants[variant] || variants.primary} ${className}`;

  if (href) {
    const isInternal = href.startsWith('/') || href.startsWith('#');
    const to = href.startsWith('#') ? `/${href}` : href;

    if (isInternal) {
      return (
        <Link to={to} className={classes} {...props}>
          {children}
        </Link>
      );
    }

    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
