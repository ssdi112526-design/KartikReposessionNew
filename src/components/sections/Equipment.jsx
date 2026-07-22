import SectionHeading from '../ui/SectionHeading';
import { getIcon } from '../../utils/icons';

export default function Equipment({ equipment = [] }) {
  return (
    <section id="equipment" className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Equipment & Tools"
          title="Modern Recovery Equipment"
          subtitle="We use advanced recovery equipment, GPS tracking and professional tools for safe and legal asset recovery."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {equipment.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-100 bg-surface p-6 transition hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
