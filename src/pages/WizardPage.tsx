import { useNavigate } from 'react-router-dom';
import { Wizard } from '@/components/Wizard';
import { useLanguagePrefix } from '@/hooks/useLanguagePrefix';

/**
 * Wizard page (step-by-step guide)
 * Prerendered for SEO - shows Instagram export instructions
 */
export function Component() {
  const navigate = useNavigate();
  const prefix = useLanguagePrefix();

  const handleComplete = () => {
    navigate(`${prefix}/waiting`);
  };

  const handleCancel = () => {
    navigate(`${prefix}/`);
  };

  return <Wizard onComplete={handleComplete} onCancel={handleCancel} />;
}

export default Component;
