import { FaArrowRight, FaChevronDown, FaHandshake } from 'react-icons/fa';
import Button from '../ui/Button';
import { companyInfo } from '../../data/content';
import heroImg from '../../assets/hero.png';

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[560px] items-center overflow-hidden bg-gradient-to-br from-sky-50 via-white to-indigo-50 py-24 md:min-h-screen md:bg-cover md:bg-center md:bg-no-repeat md:py-20 md:[background-image:var(--hero-bg)]"
      style={{ '--hero-bg': `url(${heroImg})` }}
    >
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6">
        <div className="mx-auto flex max-w-[500px] flex-col items-center text-center md:mx-0 md:items-start md:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/15 bg-white/60 px-4 py-2 text-[13px] font-semibold text-brand shadow-[0_4px_15px_rgba(59,130,246,0.05)]">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            {companyInfo.badge}
          </div>

          <h1 className="text-[clamp(32px,5vw,48px)] font-extrabold leading-[1.2] tracking-[-0.02em] text-ink">
            Legal &amp; <br />
            <span className="text-highlight">Vehicle Recovery</span> <br />
            Services Across India
          </h1>

          <div className="mt-8 flex w-full flex-wrap items-center justify-center gap-3 md:justify-start">
            <Button href="#contact" className="rounded-full px-7 py-3.5 text-[15px]">
              Request a Recovery
              <FaArrowRight className="text-xs" />
            </Button>
            <Button href="#partners" variant="secondary" className="rounded-full px-7 py-3.5 text-[15px]">
              <FaHandshake className="text-brand" />
              Our Channel Partners
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-[480px] overflow-hidden rounded-2xl border-4 border-white shadow-[0_15px_35px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)] md:hidden">
          <img
            src={heroImg}
            alt="Professional vehicle recovery tow truck"
            className="h-auto w-full"
            loading="eager"
          />
        </div>
      </div>

      <a
        href="#services"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:text-sky-400 md:flex"
      >
        Explore Services
        <FaChevronDown className="animate-bounce text-sm" />
      </a>
    </section>
  );
}
