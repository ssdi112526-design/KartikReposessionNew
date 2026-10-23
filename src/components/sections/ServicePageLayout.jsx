import { Link } from 'react-router-dom';
import {
  FaCheckCircle,
  FaArrowRight,
  FaPhoneAlt,
  FaShieldAlt,
  FaClipboardList,
  FaHandshake,
  FaMapMarkedAlt,
} from 'react-icons/fa';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Button from '../ui/Button';
import SectionHeading from '../ui/SectionHeading';
import { companyInfo } from '../../data/content';
import { getIcon } from '../../utils/icons';

const DEFAULT_PROCESS = [
  {
    title: 'Case Intake',
    description: 'Receive authorized case details and documentation from the bank or NBFC.',
    icon: FaClipboardList,
  },
  {
    title: 'Field Action',
    description: 'Dedicated teams carry out follow-ups, verification, and recovery support.',
    icon: FaMapMarkedAlt,
  },
  {
    title: 'Compliant Handling',
    description: 'All activity follows legal, contractual, and customer-friendly practices.',
    icon: FaShieldAlt,
  },
  {
    title: 'Reporting & Closure',
    description: 'Transparent status updates, documentation, and case handover to the lender.',
    icon: FaHandshake,
  },
];

export default function ServicePageLayout({
  eyebrow,
  title,
  description,
  heroIcon = 'FaCarSide',
  servicesTitle = 'Our Services',
  services = [],
  supportTitle = 'How We Support You',
  supportItems = [],
  benefitsTitle = 'Why Choose Us',
  benefits = [],
  process = DEFAULT_PROCESS,
  mission,
}) {
  const HeroIcon = getIcon(heroIcon);

  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-light via-white to-surface py-14 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                {eyebrow && (
                  <p className="text-sm font-semibold uppercase tracking-wider text-brand">{eyebrow}</p>
                )}
                <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-ink sm:text-4xl md:text-5xl">
                  {title}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
                  {description}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button href="/#contact">
                    Contact Us <FaArrowRight size={12} />
                  </Button>
                  <Button href={`tel:${companyInfo.phones[0].replace(/\s/g, '')}`} variant="outline">
                    <FaPhoneAlt size={12} />
                    {companyInfo.phones[0]}
                  </Button>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-[0_16px_40px_rgba(37,99,235,0.1)]">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-light text-brand">
                  <HeroIcon size={36} />
                </div>
                <p className="mt-5 text-center text-sm font-semibold text-ink">{companyInfo.name}</p>
                <p className="mt-2 text-center text-sm leading-relaxed text-muted">
                  Professional recovery support for banks, NBFCs, and financial institutions.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Coverage" title={servicesTitle} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-surface px-4 py-4"
                >
                  <FaCheckCircle className="mt-0.5 shrink-0 text-brand" size={16} />
                  <p className="text-sm font-medium text-ink">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {supportItems.length > 0 && (
          <section className="bg-surface py-16 md:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <SectionHeading eyebrow="Support" title={supportTitle} />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {supportItems.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
                  >
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="mt-0.5 shrink-0 text-brand" size={16} />
                      <p className="text-sm font-medium leading-relaxed text-ink">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Benefits" title={benefitsTitle} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-brand/10 bg-brand-light/40 px-5 py-5"
                >
                  <p className="text-sm font-semibold text-ink">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Process"
              title="How Our Service Works"
              subtitle="A clear, professional workflow designed for banks, NBFCs, and finance companies."
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {process.map((step, index) => {
                const Icon = step.icon;
                return (
                  <article
                    key={step.title}
                    className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand">
                        <Icon size={18} />
                      </div>
                      <span className="text-sm font-bold text-brand">0{index + 1}</span>
                    </div>
                    <h3 className="text-base font-bold text-ink">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {mission && (
          <section className="bg-white py-14 md:py-16">
            <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand">Our Mission</p>
              <p className="mt-3 text-lg font-medium leading-relaxed text-ink md:text-xl">{mission}</p>
            </div>
          </section>
        )}

        <section className="bg-ink py-14 md:py-16">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
            <div>
              <h2 className="text-2xl font-bold text-white md:text-3xl">Ready to discuss a case?</h2>
              <p className="mt-2 max-w-xl text-sm text-slate-300 md:text-base">
                Contact {companyInfo.name} for professional, legally compliant recovery support.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/#contact">
                Contact Us <FaArrowRight size={12} />
              </Button>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
