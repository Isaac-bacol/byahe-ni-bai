import React from 'react';

export type FlaticonName =
  | 'add-trip'
  | 'add'
  | 'plus'
  | 'fuel'
  | 'gas-pump'
  | 'reports'
  | 'chart-histogram'
  | 'analytics'
  | 'home'
  | 'dashboard'
  | 'route'
  | 'trip'
  | 'navigation'
  | 'garage'
  | 'motorcycle'
  | 'bike'
  | 'car'
  | 'wallet'
  | 'finances'
  | 'money'
  | 'settings'
  | 'search'
  | 'filter'
  | 'check'
  | 'compare'
  | 'trending-down'
  | 'shield'
  | 'user'
  | string;

interface FlaticonProps {
  name: FlaticonName;
  variant?: 'sr' | 'br' | 'rr' | 'ss'; // sr = solid rounded, br = bold rounded, rr = regular rounded
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | string;
  useFont?: boolean;
}

// Built-in Flaticon vector paths matching official Flaticon flat vector designs
const FLATICON_SVGS: Record<string, (props: { className?: string }) => React.ReactElement> = {
  'add': ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 5a1 1 0 1 0-2 0v4H7a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4h4a1 1 0 1 0 0-2h-4V7z" clipRule="evenodd" />
    </svg>
  ),
  'plus': ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 5a1 1 0 1 0-2 0v4H7a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4h4a1 1 0 1 0 0-2h-4V7z" clipRule="evenodd" />
    </svg>
  ),
  'add-trip': ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 5a1 1 0 1 0-2 0v4H7a1 1 0 1 0 0 2h4v4a1 1 0 1 0 2 0v-4h4a1 1 0 1 0 0-2h-4V7z" clipRule="evenodd" />
    </svg>
  ),
  'fuel': ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18 10a1 1 0 0 0-1-1h-1V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v17a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-6h1a3 3 0 0 0 3-3v-2.5a1.5 1.5 0 0 0-1-1.415V4a1 1 0 0 0-1-1 .5.5 0 0 0-.5.5V10zm-4-4H6V4h8v2zm-8 4h8v3H6v-3zm13 2a1 1 0 0 1-1 1h-2v-2h2a1 1 0 0 1 1 1z" />
    </svg>
  ),
  'gas-pump': ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18 10a1 1 0 0 0-1-1h-1V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v17a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-6h1a3 3 0 0 0 3-3v-2.5a1.5 1.5 0 0 0-1-1.415V4a1 1 0 0 0-1-1 .5.5 0 0 0-.5.5V10zm-4-4H6V4h8v2zm-8 4h8v3H6v-3zm13 2a1 1 0 0 1-1 1h-2v-2h2a1 1 0 0 1 1 1z" />
    </svg>
  ),
  'reports': ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <rect x="3" y="11" width="5" height="10" rx="2.5" />
      <rect x="9.5" y="4" width="5" height="17" rx="2.5" />
      <rect x="16" y="8" width="5" height="13" rx="2.5" />
    </svg>
  ),
  'chart-histogram': ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <rect x="3" y="11" width="5" height="10" rx="2.5" />
      <rect x="9.5" y="4" width="5" height="17" rx="2.5" />
      <rect x="16" y="8" width="5" height="13" rx="2.5" />
    </svg>
  ),
  'home': ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.707 2.293a1 1 0 0 0-1.414 0l-9 9A1 1 0 0 0 3 13h1v7a2 2 0 0 0 2 2h4a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h4a2 2 0 0 0 2-2v-7h1a1 1 0 0 0 .707-1.707l-9-9z" />
    </svg>
  ),
  'dashboard': ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.707 2.293a1 1 0 0 0-1.414 0l-9 9A1 1 0 0 0 3 13h1v7a2 2 0 0 0 2 2h4a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h4a2 2 0 0 0 2-2v-7h1a1 1 0 0 0 .707-1.707l-9-9z" />
    </svg>
  ),
  'route': ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19 14a3 3 0 1 0-3 3h-4a3 3 0 0 1-3-3 3 3 0 0 1 3-3h2a5 5 0 0 0 5-5 5 5 0 0 0-10 0v1.07A4.992 4.992 0 0 0 5 12a5 5 0 0 0 5 5h6a3 3 0 0 0 3-3zm-5-8a3 3 0 1 1 6 0 3 3 0 0 1-6 0z" />
    </svg>
  ),
  'navigation': ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2L3 21l9-4 9 4L12 2z" />
    </svg>
  ),
  'motorcycle': ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.5 12a4.5 4.5 0 1 0 4.5 4.5 4.505 4.505 0 0 0-4.5-4.5zm0 7a2.5 2.5 0 1 1 2.5-2.5 2.503 2.503 0 0 1-2.5 2.5zm-15-7A4.5 4.5 0 1 0 9 16.5 4.505 4.505 0 0 0 4.5 12zm0 7A2.5 2.5 0 1 1 7 16.5 2.503 2.503 0 0 1 4.5 19zM18.82 9H16l-2.45-3.68A1.99 1.99 0 0 0 11.88 4H9a1 1 0 0 0 0 2h2.88l1.33 2H9.27a4.52 4.52 0 0 0-4.08 2.59 1 1 0 1 0 1.8.87A2.52 2.52 0 0 1 9.27 10h4.35l1.63 2.45A4.47 4.47 0 0 0 18.82 9z" />
    </svg>
  ),
  'bike': ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.5 12a4.5 4.5 0 1 0 4.5 4.5 4.505 4.505 0 0 0-4.5-4.5zm0 7a2.5 2.5 0 1 1 2.5-2.5 2.503 2.503 0 0 1-2.5 2.5zm-15-7A4.5 4.5 0 1 0 9 16.5 4.505 4.505 0 0 0 4.5 12zm0 7A2.5 2.5 0 1 1 7 16.5 2.503 2.503 0 0 1 4.5 19zM18.82 9H16l-2.45-3.68A1.99 1.99 0 0 0 11.88 4H9a1 1 0 0 0 0 2h2.88l1.33 2H9.27a4.52 4.52 0 0 0-4.08 2.59 1 1 0 1 0 1.8.87A2.52 2.52 0 0 1 9.27 10h4.35l1.63 2.45A4.47 4.47 0 0 0 18.82 9z" />
    </svg>
  ),
  'wallet': ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21 7H5a3 3 0 0 1-3-3 1 1 0 0 1 1-1h15a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V7a3.003 3.003 0 0 1 3-3h16V3a2 2 0 0 0-2-2H3a3 3 0 0 0-3 3v14a5.006 5.006 0 0 0 5 5h16a4 4 0 0 0 4-4V9a2 2 0 0 0-2-2zm-1 8a2 2 0 1 1 2-2 2 2 0 0 1-2 2z" />
    </svg>
  ),
  'compare': ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-8.707 5.707a1 1 0 0 1-1.414 0L6.586 6.414A1 1 0 0 1 8 4.707l2.293 2.293a1 1 0 0 1 0 1.414v-.707zm5.414 9.586a1 1 0 0 1-1.414 0L12 16l2.293-2.293a1 1 0 0 1 1.414 1.414l-.879.879H18a1 1 0 1 1 0 2h-3.172l.879.879a1 1 0 0 1 0 1.414z" />
    </svg>
  ),
};

// Map friendly aliases to exact Flaticon Uicon class names
const ICON_MAP: Record<string, string> = {
  'add-trip': 'map-marker-plus',
  'add': 'add',
  'plus': 'add',
  'fuel': 'gas-pump',
  'gas-pump': 'gas-pump',
  'reports': 'chart-histogram',
  'chart-histogram': 'chart-histogram',
  'analytics': 'chart-histogram',
  'home': 'home',
  'dashboard': 'dashboard',
  'route': 'route',
  'trip': 'route',
  'navigation': 'navigation',
  'garage': 'car-garage',
  'motorcycle': 'motorcycle',
  'bike': 'motorcycle',
  'car': 'car-side',
  'wallet': 'wallet',
  'finances': 'wallet',
  'money': 'money-bill-wave-alt',
  'settings': 'settings-sliders',
  'search': 'search',
  'filter': 'bars-filter',
  'check': 'check',
  'compare': 'badge-percent',
  'trending-down': 'arrow-trend-down',
  'shield': 'shield-check',
  'user': 'circle-user',
};

const SIZE_MAP: Record<string, string> = {
  xs: 'w-3.5 h-3.5 text-xs',
  sm: 'w-4 h-4 text-sm',
  md: 'w-5 h-5 text-base',
  lg: 'w-6 h-6 text-lg',
  xl: 'w-7 h-7 text-xl',
  '2xl': 'w-8 h-8 text-2xl',
};

export const Flaticon: React.FC<FlaticonProps> = ({
  name,
  variant = 'sr',
  className = '',
  size,
  useFont = false,
}) => {
  const sizeClass = size ? SIZE_MAP[size] || size : '';

  // 1. If vector SVG is available and font is not forced, render exact Flaticon vector SVG
  if (!useFont && FLATICON_SVGS[name]) {
    const Component = FLATICON_SVGS[name];
    return <Component className={`inline-block shrink-0 ${sizeClass} ${className}`} />;
  }

  // 2. Otherwise render official Flaticon Uicon font glyph
  const resolvedName = ICON_MAP[name] || name;
  return (
    <i
      className={`fi fi-${variant}-${resolvedName} leading-none inline-flex items-center justify-center shrink-0 ${sizeClass} ${className}`}
      aria-hidden="true"
    />
  );
};

export default Flaticon;
