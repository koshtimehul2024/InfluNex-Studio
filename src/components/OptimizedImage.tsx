import { ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  webpSrc?: string;
  className?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  webpSrc, 
  className,
  loading = 'lazy',
  ...props 
}: OptimizedImageProps) {
  // Auto-generate WebP path if not provided
  const webpPath = webpSrc || src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  
  return (
    <picture>
      <source srcSet={webpPath} type="image/webp" />
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={cn(className)}
        {...props}
      />
    </picture>
  );
}
