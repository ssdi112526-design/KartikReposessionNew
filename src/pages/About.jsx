import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { companyInfo } from '../data/content';

const OFFICE_PHOTOS = [
  { src: '/about/office-1.jpg', alt: 'Kartik Repossession Agency operations team at work' },
  { src: '/about/office-2.jpg', alt: 'Delhi office control desk coordinating recovery cases' },
  { src: '/about/office-3.jpg', alt: 'Field coordination and lender communication desk' },
  { src: '/about/office-4.jpg', alt: 'Operations team managing repossession workflows' },
];

export default function About() {
  return (
    <>
      <Navbar />
      <main>
        <section className="border-b border-slate-100 bg-surface">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand">About Company</p>
            <h1 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">{companyInfo.name}</h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">{companyInfo.tagline}</p>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">
              Based in Shiv Vihar, Karawal Nagar, North East Delhi, we support banks, NBFCs, and finance
              companies with legally compliant asset repossession, debt collection, and secure yard
              parking — backed by an active field and operations team working round the clock.
            </p>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-ink sm:text-2xl">Our Operations Office</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              A look inside our Delhi control desk — where case coordination, lender updates, and
              recovery follow-ups happen every day.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {OFFICE_PHOTOS.map((photo) => (
                <figure
                  key={photo.src}
                  className="overflow-hidden rounded-xl border border-slate-100 bg-surface"
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="h-56 w-full object-cover sm:h-64 md:h-72"
                    loading="lazy"
                  />
                </figure>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-100 bg-surface p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Headquarters</p>
                <p className="mt-2 text-sm leading-relaxed text-ink">{companyInfo.address}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-surface p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Phone</p>
                <div className="mt-2 space-y-1 text-sm text-ink">
                  {companyInfo.phones.map((phone) => (
                    <a key={phone} href={`tel:${phone.replace(/\s/g, '')}`} className="block hover:text-brand">
                      {phone}
                    </a>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-surface p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Email</p>
                <a
                  href={`mailto:${companyInfo.email}`}
                  className="mt-2 block text-sm text-ink hover:text-brand"
                >
                  {companyInfo.email}
                </a>
                <p className="mt-3 text-sm text-muted">{companyInfo.hours}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
