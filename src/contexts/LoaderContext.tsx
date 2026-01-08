import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface LoaderContextType {
  isLoading: boolean;
  showLoader: () => void;
  hideLoader: () => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true); // Start with loader visible
  const [loadingCount, setLoadingCount] = useState(0);

  const showLoader = useCallback(() => {
    setLoadingCount(prev => prev + 1);
    setIsLoading(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const hideLoader = useCallback(() => {
    setLoadingCount(prev => {
      const newCount = Math.max(0, prev - 1);
      if (newCount === 0) {
        setIsLoading(false);
        document.body.style.overflow = '';
      }
      return newCount;
    });
  }, []);

  // Hide initial loader after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      hideLoader();
    }, 1000);

    return () => clearTimeout(timer);
  }, [hideLoader]);

  return (
    <LoaderContext.Provider value={{ isLoading, showLoader, hideLoader }}>
      {children}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const context = useContext(LoaderContext);
  if (context === undefined) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
}
