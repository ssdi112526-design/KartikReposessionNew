import ServicePageLayout from '../components/sections/ServicePageLayout';

const SERVICES = [
  'Cars and Auto Loans',
  'Commercial Vehicles, Trucks and Tempos',
  'Two-Wheelers and Three-Wheelers',
  'Earthmoving and Construction Equipment (CE)',
  'Generators and Industrial Machinery',
  'Business and Commercial Financed Assets',
  'Consumer Durable Asset Repossession',
  'Machinery and Industrial Equipment Repossession',
  'All Types of Eligible Financed Assets',
];

const SUPPORT = [
  'Vehicle and Asset Tracing',
  'Field Verification and Case Follow-ups',
  'Authorized Repossession Coordination',
  'Parking Yard Management',
  'Inventory Documentation and Handover',
  'Recovery Status Updates and Reporting',
  'Coordination with Banks, NBFCs, and Finance Companies',
];

const BENEFITS = [
  'Professional Field Recovery Support',
  'Legally Compliant Repossession Practices',
  'Transparent Case Updates and Reporting',
  'Authorized Asset Recovery Coordination',
  'Bank and NBFC Focused Operations',
  'Secure Documentation and Handover Process',
];

export default function Repossession() {
  return (
    <ServicePageLayout
      eyebrow="Asset Repossession"
      title="Professional Asset Repossession Services"
      description="We provide professional, legally compliant asset recovery and repossession support for banks, NBFCs, and financial institutions. Our services cover financed vehicles, machinery, equipment, and other eligible assets in cases of loan default, subject to applicable laws, contractual terms, and required authorizations."
      heroIcon="FaCarSide"
      servicesTitle="Our Asset Repossession Services"
      services={SERVICES}
      supportTitle="Our Repossession Support Includes"
      supportItems={SUPPORT}
      benefitsTitle="Why Choose Our Repossession Services?"
      benefits={BENEFITS}
      mission="To support financial institutions in recovering financed assets through a professional, transparent, and legally compliant repossession process."
    />
  );
}
