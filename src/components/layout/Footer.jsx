import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaFacebookF, FaLinkedinIn, FaInstagram, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import Logo from '../ui/Logo';
import { companyInfo, socialLinks } from '../../data/content';

const socialIconMap = {
  FaFacebookF,
  FaXTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
};

const quickLinks = [
  { label: 'Our Services', href: '#services' },
  { label: 'Channel Partners', href: '#partners' },
  { label: 'Recovery Process', href: '#what-we-handle' },
  { label: 'FAQs', href: '#faq' },
];

const serviceLinks = [
  'Vehicle Repossession',
  'Legal Documentation',
  'Yard Storage',
  'CV Recovery',
  'Two-Wheeler Recovery',
  'Recovery Reports',
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-ink text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo className="[&_span:last-child]:text-white" />
          <p className="mt-4 text-sm leading-relaxed text-slate-400">{companyInfo.tagline}</p>
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            {socialLinks.map((social) => {
              const Icon = socialIconMap[social.icon];
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-brand/40 hover:bg-white/10 hover:text-white"
                >
                  <Icon size={14} />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Quick Links</h3>
          <ul className="space-y-2.5 text-sm">
            {quickLinks.map((item) => (
              <li key={item.label}>
                <a href={item.href} className="hover:text-white">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Services</h3>
          <ul className="space-y-2.5 text-sm">
            {serviceLinks.map((item) => (
              <li key={item}>
                <a href="#services" className="hover:text-white">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2">
              <FaMapMarkerAlt className="mt-1 shrink-0 text-brand" />
              <span>Shiv Vihar, Karawal Nagar, North East Delhi – 110094</span>
            </li>
            {companyInfo.phones.map((phone) => (
              <li key={phone} className="flex items-center gap-2">
                <FaPhoneAlt className="shrink-0 text-brand" />
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-white">
                  {phone}
                </a>
              </li>
            ))}
            <li className="flex items-center gap-2">
              <FaEnvelope className="shrink-0 text-brand" />
              <a href={`mailto:${companyInfo.email}`} className="hover:text-white">
                {companyInfo.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 Kartik Repossession Agency. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#contact" className="hover:text-slate-300">
              Privacy Policy
            </a>
            <a href="#contact" className="hover:text-slate-300">
              Terms of Service
            </a>
            <a href="#contact" className="hover:text-slate-300">
              Disclaimer
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
