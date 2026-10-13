import type { ReactNode, SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 18, children, strokeWidth = 2, ...rest }: P & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function Logo({ size = 46 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 46 46" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="42" height="42" rx="12" />
      <path d="M23 11c-4-3-11-1-11 5-4 1-5 7-1 10-1 5 4 9 8 7 1 2 3 3 4 3V11z" />
      <path d="M23 11c4-3 11-1 11 5 4 1 5 7 1 10 1 5-4 9-8 7-1 2-3 3-4 3" />
      <circle cx="17" cy="20" r="1.6" />
      <circle cx="17" cy="28" r="1.6" />
      <path d="M18.6 20H23M18.6 28H23M28 18v4h-5M28 30v-4h-5" />
    </svg>
  );
}

export function ModuleIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 20) / 24} viewBox="0 0 24 20" fill="currentColor" aria-hidden="true">
      <rect x="1" y="3" width="6" height="5" rx="1" />
      <rect x="8.5" y="3" width="6" height="5" rx="1" />
      <rect x="1" y="10" width="6" height="6" rx="1" />
      <path d="M16 5h6l-2 3h2v6l-3-2h-3z" />
    </svg>
  );
}

export const ChevronRight = (p: P) => <Svg {...p}><path d="M9 6l6 6-6 6" /></Svg>;
export const ChevronLeft = (p: P) => <Svg {...p}><path d="M15 6l-6 6 6 6" /></Svg>;
export const ChevronDown = (p: P) => <Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>;
export const Back = (p: P) => <Svg {...p}><path d="M15 5l-7 7 7 7" /></Svg>;

export const SideCollapse = (p: P) => (
  <Svg strokeWidth={2} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="1.5" />
    <path d="M14 3v18" />
    <path d="M14 3h7v18h-7z" fill="currentColor" />
    <path d="M10 9l-3 3 3 3" />
  </Svg>
);
export const SideExpand = (p: P) => (
  <Svg strokeWidth={2} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="1.5" />
    <path d="M10 3v18" />
    <path d="M3 3h7v18H3z" fill="currentColor" />
    <path d="M14 9l3 3-3 3" />
  </Svg>
);
export const Support = (p: P) => (
  <Svg strokeWidth={1.8} {...p}>
    <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
    <rect x="3" y="14" width="4" height="7" rx="1.5" />
    <rect x="17" y="14" width="4" height="7" rx="1.5" />
    <circle cx="9" cy="11" r="0.6" fill="currentColor" />
    <circle cx="15" cy="11" r="0.6" fill="currentColor" />
  </Svg>
);
export const Settings = (p: P) => (
  <Svg strokeWidth={1.8} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </Svg>
);

export const Chat = (p: P) => <Svg strokeWidth={1.9} {...p}><path d="M4 5h16v11H9l-5 4z" /></Svg>;
export const ChatLines = (p: P) => <Svg {...p}><path d="M4 5h16v11H9l-5 4z" /><path d="M8.5 9.5h7M8.5 12.5h4" /></Svg>;
export const Grid = (p: P) => (
  <Svg strokeWidth={1.9} {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" />
  </Svg>
);
export const Database = (p: P) => (
  <Svg {...p}>
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
    <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
  </Svg>
);
export const DatabaseStack = (p: P) => (
  <Svg {...p}>
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
    <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
  </Svg>
);
export const ModelIcon = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="6" rx="1.5" />
    <rect x="14" y="3" width="7" height="6" rx="1.5" />
    <rect x="14" y="15" width="7" height="6" rx="1.5" />
    <path d="M10 6h4" />
    <path d="M6.5 9v6.5a1.5 1.5 0 0 0 1.5 1.5h6" />
  </Svg>
);
export const Pin = (p: P) => <Svg strokeWidth={1.9} {...p}><path d="M12 17v5" /><path d="M9 3h6l-1 6 4 4H6l4-4z" /></Svg>;
export const Search = (p: P) => <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></Svg>;
export const Close = (p: P) => <Svg strokeWidth={2.2} {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>;
export const Plus = (p: P) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
export const Check = (p: P) => <Svg {...p}><path d="M5 12l5 5 9-10" /></Svg>;
export const Kebab = (p: P) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <circle cx="12" cy="5" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="12" cy="19" r="1.8" />
  </Svg>
);
export const Dots = (p: P) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <circle cx="5" cy="12" r="1.9" />
    <circle cx="12" cy="12" r="1.9" />
    <circle cx="19" cy="12" r="1.9" />
  </Svg>
);
export const Refresh = (p: P) => <Svg {...p}><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></Svg>;
export const Replay = (p: P) => <Svg {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></Svg>;
export const Sync = (p: P) => (
  <Svg {...p}><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4" /></Svg>
);
export const Download = (p: P) => <Svg {...p}><path d="M12 4v11" /><path d="M7 10l5 5 5-5" /><path d="M5 20h14" /></Svg>;
export const Columns = (p: P) => <Svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16M15 4v16" /></Svg>;
export const Arrow = (p: P) => <Svg strokeWidth={2.4} {...p}><path d="M5 12h12M13 7l5 5-5 5" /></Svg>;
export const Filter = (p: P) => <Svg {...p}><path d="M3 5h18l-7 8v6l-4 2v-8z" /></Svg>;
export const TableIcon = (p: P) => <Svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M3 15h18M9 10v10" /></Svg>;
export const ColumnIcon = (p: P) => <Svg {...p}><path d="M6 20V11M12 20V4M18 20v-7" /></Svg>;
export const LineIcon = (p: P) => <Svg {...p}><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 6-6" /></Svg>;
export const AreaIcon = (p: P) => (
  <Svg {...p}><path d="M3 3v18h18" /><path d="M7 16l4-5 3 3 6-6v10H7z" fill="currentColor" fillOpacity="0.25" /></Svg>
);
export const BarIcon = (p: P) => <Svg {...p}><path d="M4 6h10M4 12h16M4 18h7" /></Svg>;
export const Expand = (p: P) => <Svg {...p}><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" /></Svg>;
export const Trash = (p: P) => <Svg {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></Svg>;
export const Send = (p: P) => <Svg {...p}><path d="M3 4l18 8-18 8 3-8z" /><path d="M6 12h15" /></Svg>;
export const Sparkle = (p: P) => (
  <Svg {...p}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
  </Svg>
);
export const SparkleFill = (p: P) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <path d="M12 2.5l2.1 6.1 6.4 2.4-6.4 2.4L12 19.5l-2.1-6.1-6.4-2.4 6.4-2.4z" />
    <path d="M19 15.5l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9z" opacity=".8" />
  </Svg>
);
export const Copy = (p: P) => <Svg {...p}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a1 1 0 0 1 1-1h10" /></Svg>;
export const ThumbUp = (p: P) => (
  <Svg {...p}><path d="M7 11v9H4v-9z" /><path d="M7 11l4-7a2 2 0 0 1 3 2l-1 4h6a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 17.8 20H7" /></Svg>
);
export const ThumbDown = (p: P) => <ThumbUp {...p} style={{ transform: 'rotate(180deg)' }} />;
export const FollowUp = (p: P) => <Svg {...p}><path d="M9 14l-4-4 4-4" /><path d="M5 10h9a5 5 0 0 1 5 5v4" /></Svg>;
export const ListIcon = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="4" width="4.5" height="4.5" rx="1" />
    <rect x="3" y="10" width="4.5" height="4.5" rx="1" />
    <rect x="3" y="16" width="4.5" height="4.5" rx="1" />
    <path d="M11 6.25h10M11 12.25h10M11 18.25h7" />
  </Svg>
);

export function StepDone({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#10B981" />
      <path d="M7.5 12.5l3 3 6-6" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export function StepRunning({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className="spin">
      <circle cx="12" cy="12" r="9" stroke="#DBE5FB" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
export function StepPending({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="3 3" />
    </svg>
  );
}
