import ServicePageLayout from '../components/sections/ServicePageLayout';

const SERVICES = [
  'Consumer Loan Collection',
  'Home Loan Collection',
  'Personal Loan Collection',
  'Business Loan Collection',
  'Commercial Vehicle Loan Collection',
  'Auto Loan Collection',
  'Construction Equipment (CE) Loan Collection',
  'Two-Wheeler Loan Collection',
  'Credit Card Outstanding Collection',
  'Machinery and Industrial Equipment Loan Collection',
  'Overdue EMI and Outstanding Payment Recovery',
  'All Types of Financed Asset Loan Collection',
];

const SUPPORT = [
  'Customer Follow-ups and Payment Reminders',
  'Professional Field Collection Support',
  'Overdue EMI Recovery',
  'Dedicated Collection Teams',
  'Transparent Reporting and Case Updates',
  'Customer-Friendly and Legally Compliant Recovery Practices',
];

const BENEFITS = [
  'Bank and NBFC Collection Support',
  'Reliable Recovery Follow-ups',
  'Field Collection Expertise',
  'Clear Status Reporting',
  'Legally Compliant Practices',
  'Improved Recovery Efficiency',
];

export default function DebtCollection() {
  return (
    <ServicePageLayout
      eyebrow="Debt Collection"
      title="Professional Debt Collection Services"
      description="KARTIK REPOSSESSION AGENCY is a debt collection and recovery agency operating in New Delhi, providing professional recovery support to banks, NBFCs, and financial institutions. Our services help recover overdue EMIs, outstanding loan payments, and unpaid dues through professional follow-ups, customer communication, and field recovery support."
      heroIcon="FaHandHoldingUsd"
      servicesTitle="Our Debt Collection Services"
      services={SERVICES}
      supportTitle="How Our Collection Support Works"
      supportItems={SUPPORT}
      benefitsTitle="Why Choose Our Debt Collection Services?"
      benefits={BENEFITS}
      mission="To help financial institutions improve recovery rates, reduce overdue accounts, and manage loan collections efficiently."
    />
  );
}
