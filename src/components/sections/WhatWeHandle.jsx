import SectionHeading from '../ui/SectionHeading';
import Button from '../ui/Button';
import { getIcon } from '../../utils/icons';
import { whatWeHandle } from '../../data/content';

export default function WhatWeHandle() {
  return (
    <section id="what-we-handle" className="bg-ink py-16 text-white md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="What We Handle"
          subtitle="End-to-end recovery capabilities tailored for banks and financial institutions."
          className="[&_h2]:text-white [&_p]:text-slate-400"
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {whatWeHandle.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-700/80 bg-slate-900/50 p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand/20 text-brand">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.description}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Button href="#contact" className="rounded-full px-8">
            Request a Recovery
          </Button>
        </div>
      </div>
    </section>
  );
}
