import { FaBuilding, FaCircle } from 'react-icons/fa';
import SectionHeading from '../ui/SectionHeading';

export default function Partners({ partners = [] }) {
  return (
    <section id="partners" className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our Network"
          title="Authorised Channel Partners"
          subtitle="Kartik Repossession Agency is an authorised recovery partner for India's leading banks, NBFC, and financial institutions."
        />

        <div className="mb-8 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
            <FaCircle size={8} className="animate-pulse text-emerald-500" />
            24/7 Field Operations Active
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {partners.map((partner) => (
            <article
              key={partner.name}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-surface p-4 transition hover:border-brand/20 hover:bg-white hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-brand shadow-sm">
                <FaBuilding size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">{partner.type}</p>
                <h3 className="truncate text-sm font-bold text-ink">{partner.name}</h3>
                <p className="mt-1 text-xs font-medium text-emerald-600">
                  {partner.status}
                  {partner.badge ? ` · ${partner.badge}` : ''}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
