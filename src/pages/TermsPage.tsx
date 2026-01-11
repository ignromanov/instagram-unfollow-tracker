import { useNavigate } from 'react-router-dom';
import { TermsOfService } from '@/components/TermsOfService';
import { useLanguagePrefix } from '@/hooks/useLanguagePrefix';

/**
 * Terms of Service page
 * Prerendered for SEO
 */
export function Component() {
  const navigate = useNavigate();
  const prefix = useLanguagePrefix();

  const handleBack = () => {
    navigate(`${prefix}/`);
  };

  return <TermsOfService onBack={handleBack} />;
}

export default Component;
