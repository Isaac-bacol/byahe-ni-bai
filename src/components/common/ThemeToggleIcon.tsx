import React from 'react';

interface Props {
  className?: string;
  isDarkMode?: boolean;
}

export const ThemeToggleIcon: React.FC<Props> = ({ className = 'w-4 h-4', isDarkMode }) => {
  return (
    <span
      className={`block shrink-0 bg-current transition-transform duration-300 ${
        isDarkMode ? 'rotate-0' : '-rotate-12'
      } text-slate-800 dark:text-slate-100 ${className}`}
      style={{
        maskImage: 'url(/theme-icon.png)',
        WebkitMaskImage: 'url(/theme-icon.png)',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
      aria-hidden="true"
    />
  );
};
