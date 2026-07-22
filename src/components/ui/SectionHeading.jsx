export default function SectionHeading({ eyebrow, title, subtitle, center = true, className = '' }) {
  return (
    <div className={`mb-10 md:mb-12 ${center ? 'mx-auto max-w-2xl text-center' : ''} ${className}`}>
      {eyebrow && (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand">{eyebrow}</p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-base text-muted md:text-lg">{subtitle}</p>}
    </div>
  );
}
