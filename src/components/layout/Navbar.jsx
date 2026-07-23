import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import { navLinks } from '../../data/content';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
          <Link to="/terms" className="text-sm font-medium text-slate-600 transition hover:text-brand">
            Terms &amp; Conditions
          </Link>
        </nav>

        <div className="hidden lg:block">
          <Button href="/#contact">Contact</Button>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-ink lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-brand-light hover:text-brand"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/terms"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-brand-light hover:text-brand"
              onClick={() => setOpen(false)}
            >
              Terms &amp; Conditions
            </Link>
            <Button href="/#contact" className="mt-2 w-full" onClick={() => setOpen(false)}>
              Contact
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
