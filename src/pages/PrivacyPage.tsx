import { useNavigate } from 'react-router-dom';
import { PrivacyPolicy } from '@/components/PrivacyPolicy';
import { useLanguagePrefix } from '@/hooks/useLanguagePrefix';

/**
 * Privacy Policy page
 * Prerendered for SEO
 */
export function Component() {
  const navigate = useNavigate();
  const prefix = useLanguagePrefix();

  const handleBack = () => {
    navigate(`${prefix}/`);
  };

  return <PrivacyPolicy onBack={handleBack} />;
}

export default Component;
