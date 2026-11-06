import { FaArrowRight, FaChevronDown, FaHandshake } from 'react-icons/fa';
import Button from '../ui/Button';
import DiyaIcon from '../ui/DiyaIcon';
import { companyInfo } from '../../data/content';
import heroImg from '../../assets/hero.jpg';

export default function Hero() {
  return (
    <section
      id="home"
      className="diwali-hero relative isolate flex min-h-[640px] items-center overflow-hidden py-24 md:min-h-screen md:py-20"
    >
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImg})` }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6">
        <div className="mx-auto flex max-w-[600px] flex-col items-center text-center md:mx-0 md:items-start md:text-left">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/15 bg-white/80 px-4 py-2 text-[13px] font-semibold text-brand shadow-[0_4px_15px_rgba(59,130,246,0.08)] backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
            {companyInfo.badge}
          </div>

          <h1 className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:justify-start">
            <DiyaIcon className="diwali-diya text-[clamp(28px,6vw,48px)]" />
            <span className="diwali-hero-title text-[clamp(30px,6.5vw,58px)] font-black leading-none tracking-[-0.03em]">
              Happy Diwali
            </span>
            <DiyaIcon className="diwali-diya diwali-diya-delay text-[clamp(28px,6vw,48px)]" />
          </h1>

          <p className="diwali-hero-subtitle mt-4 text-[clamp(15px,2.3vw,19px)] font-semibold text-ink-soft drop-shadow-[0_1px_6px_rgba(255,255,255,0.9)]">
            Wishing You Happiness, Prosperity &amp; Success
          </p>

          <h2 className="mt-7 text-[clamp(18px,3vw,28px)] font-extrabold leading-[1.3] tracking-[-0.02em] text-ink drop-shadow-[0_1px_8px_rgba(255,255,255,0.85)]">
            Bank / NBFC Authorized Agency
            <span className="mt-1 block text-highlight">Repossession Collection</span>
          </h2>

          <div className="mt-8 flex w-full flex-wrap items-center justify-center gap-3 md:justify-start">
            <Button href="#contact" className="rounded-full px-7 py-3.5 text-[15px] shadow-[0_0_28px_rgba(59,130,246,0.35)]">
              Request a Recovery
              <FaArrowRight className="text-xs" />
            </Button>
            <Button href="#partners" variant="secondary" className="rounded-full px-7 py-3.5 text-[15px]">
              <FaHandshake className="text-brand" />
              Our Channel Partners
            </Button>
          </div>
        </div>
      </div>

      <a
        href="#services"
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:text-sky-400 md:flex"
      >
        Explore Services
        <FaChevronDown className="animate-bounce text-sm" />
      </a>
    </section>
  );
}
