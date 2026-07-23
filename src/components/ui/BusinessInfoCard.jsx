import { BadgeCheck, Building2, Globe, Mail, PenTool, Phone, User } from 'lucide-react';

const rows = [
  {
    icon: Building2,
    label: 'Business Name',
    value: 'Kartik Reposession Agency',
  },
  {
    icon: User,
    label: 'Proprietor',
    value: 'Ashwani Kumar',
  },
  {
    icon: Phone,
    label: 'Contact',
    value: '+91 9654008400',
    href: 'tel:+919654008400',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'kartikashwanikumar@gmail.com',
    href: 'mailto:kartikashwanikumar@gmail.com',
  },
  {
    icon: Globe,
    label: 'Website',
    value: 'www.kartikemi.com',
    href: 'https://www.kartikemi.com',
    external: true,
  },
];

export default function BusinessInfoCard() {
  return (
    <article
      aria-labelledby="official-business-heading"
      className="group flex h-full flex-col rounded-[20px] border border-brand/25 bg-white/90 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_16px_40px_rgba(37,99,235,0.12)] md:p-8"
    >
      <header className="mb-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand">
            <BadgeCheck className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h3 id="official-business-heading" className="text-xl font-bold tracking-tight text-ink">
              Official Business Information
            </h3>
            <p className="mt-0.5 text-sm font-medium text-muted">A Proprietorship Firm</p>
          </div>
        </div>
      </header>

      <dl className="flex flex-1 flex-col gap-4">
        {rows.map(({ icon: Icon, label, value, href, external }) => (
          <div key={label} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</dt>
              <dd className="mt-0.5 text-sm font-semibold text-ink sm:text-[15px]">
                {href ? (
                  <a
                    href={href}
                    className="transition hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                    {...(external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    {value}
                  </a>
                ) : (
                  value
                )}
              </dd>
            </div>
          </div>
        ))}
      </dl>

      <footer className="mt-8 border-t border-slate-200 pt-6">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
            <PenTool className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Authorized Signature</p>
            <p
              className="mt-2 text-3xl leading-none text-ink sm:text-4xl"
              style={{ fontFamily: '"Great Vibes", cursive' }}
              aria-hidden="true"
            >
              Ashwani Kumar
            </p>
            <p className="mt-3 text-sm font-bold text-ink">Ashwani Kumar</p>
            <p className="text-sm text-muted">Proprietor</p>
          </div>
        </div>
      </footer>
    </article>
  );
}
