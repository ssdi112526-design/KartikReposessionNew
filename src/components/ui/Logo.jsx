import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo.png';

export default function Logo({ className = '', showText = true }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 ${className}`}>
      <img src={logoImg} alt="Kartik Repossession Agency" className="h-11 w-11 shrink-0 object-contain" />
      {showText && (
        <span className="text-[15px] font-bold leading-tight text-ink sm:text-base">
          Kartik Repossession Agency
        </span>
      )}
    </Link>
  );
}
