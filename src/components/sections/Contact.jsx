import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaCheckCircle, FaClock, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import SectionHeading from '../ui/SectionHeading';
import Button from '../ui/Button';
import BusinessInfoCard from '../ui/BusinessInfoCard';
import { companyInfo, serviceOptions } from '../../data/content';
import { contactService } from '../../services';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await contactService.create(data);
      setSubmitted(true);
      reset();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        'Unable to send message. Please try again or call us directly.';
      setServerError(message);
    }
  };

  return (
    <section id="contact" className="bg-surface py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Contact Us"
          title="Get In Touch"
          subtitle="Reach out to discuss your NPA portfolio requirements. We respond within one business day."
        />

        <div className="space-y-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              icon={FaMapMarkerAlt}
              title="Registered Office"
              body={companyInfo.address}
            />
            <InfoCard
              icon={FaPhoneAlt}
              title="Phone"
              body={
                <div className="space-y-1">
                  {companyInfo.phones.map((phone) => (
                    <a key={phone} href={`tel:${phone.replace(/\s/g, '')}`} className="block hover:text-brand">
                      {phone}
                    </a>
                  ))}
                </div>
              }
            />
            <InfoCard
              icon={FaEnvelope}
              title="Email"
              body={
                <a href={`mailto:${companyInfo.email}`} className="hover:text-brand">
                  {companyInfo.email}
                </a>
              }
            />
            <InfoCard icon={FaClock} title="Working Hours" body={companyInfo.hours} />
          </div>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
              {submitted ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                  <FaCheckCircle className="mb-4 text-5xl text-emerald-500" />
                  <h3 className="text-2xl font-bold text-ink">Message Sent!</h3>
                  <p className="mt-2 text-muted">We&apos;ll get back to you shortly.</p>
                  <Button className="mt-6" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-ink">Send a Message</h3>
                  <p className="mt-1 text-sm text-muted">
                    Fill in the details and our team will get back to you shortly.
                  </p>

                  <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Full Name *" error={errors.fullName?.message}>
                        <input
                          className={inputClass(errors.fullName)}
                          placeholder="e.g. Rajesh Sharma"
                          {...register('fullName', { required: 'Full name is required' })}
                        />
                      </Field>
                      <Field label="Email Address *" error={errors.email?.message}>
                        <input
                          type="email"
                          className={inputClass(errors.email)}
                          placeholder="you@company.com"
                          {...register('email', {
                            required: 'Email is required',
                            pattern: {
                              value: /^\S+@\S+\.\S+$/,
                              message: 'Enter a valid email',
                            },
                          })}
                        />
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Phone Number" error={errors.phone?.message}>
                        <input
                          className={inputClass(errors.phone)}
                          placeholder="+91 98765 43210"
                          {...register('phone')}
                        />
                      </Field>
                      <Field label="Organisation" error={errors.organisation?.message}>
                        <input
                          className={inputClass(errors.organisation)}
                          placeholder="Bank / NBFC name"
                          {...register('organisation')}
                        />
                      </Field>
                    </div>

                    <Field label="Service Required *" error={errors.serviceRequired?.message}>
                      <select
                        className={inputClass(errors.serviceRequired)}
                        defaultValue=""
                        {...register('serviceRequired', { required: 'Please select a service' })}
                      >
                        <option value="" disabled>
                          Select a service
                        </option>
                        {serviceOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Message *" error={errors.message?.message}>
                      <textarea
                        rows={4}
                        className={inputClass(errors.message)}
                        placeholder="Briefly describe your requirement or NPA portfolio details..."
                        {...register('message', { required: 'Message is required' })}
                      />
                    </Field>

                    {serverError && (
                      <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{serverError}</p>
                    )}

                    <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>

                    <p className="text-xs text-muted">
                      Your information is kept confidential and never shared.
                    </p>
                  </form>
                </>
              )}
            </div>

            <BusinessInfoCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-ink-soft">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}

function InfoCard({ icon: Icon, title, body }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand">
        <Icon size={16} />
      </div>
      <h3 className="font-bold text-ink">{title}</h3>
      <div className="mt-1 text-sm leading-relaxed text-muted">{body}</div>
    </div>
  );
}

function inputClass(error) {
  return `w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${
    error ? 'border-red-400' : 'border-slate-200'
  }`;
}
