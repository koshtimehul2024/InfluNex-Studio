import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoader } from '@/contexts/LoaderContext';

export function useRouteLoader() {
  const location = useLocation();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    showLoader();
    
    // Simulate route transition
    const timer = setTimeout(() => {
      hideLoader();
    }, 800);

    return () => {
      clearTimeout(timer);
      hideLoader();
    };
  }, [location.pathname, showLoader, hideLoader]);
}
