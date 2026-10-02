import React, { useEffect, useRef, useState } from 'react';

interface Props {
  text: string;
  className?: string;
  wordClassName?: string;
  delayStart?: number;
  staggerMs?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
}

export const WordReveal: React.FC<Props> = ({
  text,
  className = '',
  wordClassName = '',
  delayStart = 0,
  staggerMs = 50,
  as: Component = 'div',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const words = text.split(' ');

  return (
    <Component ref={containerRef as any} className={`inline-block ${className}`}>
      {words.map((word, idx) => (
        <span
          key={idx}
          className={`inline-block mr-[0.28em] transition-all duration-700 ease-out ${wordClassName} ${
            isVisible
              ? 'opacity-100 translate-y-0 filter-none'
              : 'opacity-0 translate-y-4 blur-[3px]'
          }`}
          style={{
            transitionDelay: `${delayStart + idx * staggerMs}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </Component>
  );
};
