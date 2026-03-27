'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

type Variant = 'fade-up' | 'fade-in' | 'scale-in' | 'slide-left' | 'slide-right';

const initialStyles: Record<Variant, string> = {
  'fade-up': 'opacity-0 translate-y-8',
  'fade-in': 'opacity-0',
  'scale-in': 'opacity-0 scale-95',
  'slide-left': 'opacity-0 translate-x-8',
  'slide-right': 'opacity-0 -translate-x-8',
};

const finalStyles: Record<Variant, string> = {
  'fade-up': 'opacity-100 translate-y-0',
  'fade-in': 'opacity-100',
  'scale-in': 'opacity-100 scale-100',
  'slide-left': 'opacity-100 translate-x-0',
  'slide-right': 'opacity-100 translate-x-0',
};

export function AnimateOnScroll({
  children,
  variant = 'fade-up',
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? finalStyles[variant] : initialStyles[variant]
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  );
}
