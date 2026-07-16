// Shared SVG icons ported from the vanilla app. Each takes normal SVG props.
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const IconCheck = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth={3} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
export const IconChevronRight = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth={2.2} {...p}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);
export const IconChevronLeft = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth={2.2} {...p}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);
export const IconX = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth={2.6} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const IconPlay = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M8 5v14l11-7z" />
  </svg>
);
export const IconSpeaker = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M4 9v6h4l5 5V4L8 9H4z" />
    <path d="M16.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round" />
  </svg>
);
export const IconHome = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...p}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10v10h5v-6h4v6h5V10" />
  </svg>
);
export const IconLine = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...p}>
    <circle cx="6" cy="5" r="2.2" />
    <circle cx="18" cy="19" r="2.2" />
    <path d="M6 7.2V15a4 4 0 0 0 4 4h5.8" />
  </svg>
);
export const IconPractice = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} {...p}>
    <path d="M3 10v4M7.5 6v12M12 3v18M16.5 7v10M21 10v4" />
  </svg>
);
export const IconFlame = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 2c1 3-1 4.5-2 6-1.2 1.8-1.5 3.6-.4 5.4C8 13 7.2 11.8 7 10.4 5.6 12 5 14 5 15.5 5 19.1 8.1 22 12 22s7-2.9 7-6.5c0-4.4-3.4-6.1-4.6-9C13.6 4.6 13.4 3.3 12 2z" />
  </svg>
);
export const IconShield = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth={2.4} {...p}>
    <path d="M12 3l7 3v5c0 4.4-3 8.4-7 10-4-1.6-7-5.6-7-10V6z" />
  </svg>
);
export const IconCards = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth={2.2} {...p}>
    <rect x="3" y="6" width="13" height="15" rx="2" />
    <path d="M8 3h11a2 2 0 0 1 2 2v13" />
  </svg>
);
export const IconEar = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth={2.2} {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 3-2 3.5-2 6a4 4 0 0 1-8 0" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </svg>
);
export const IconQuiz = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth={2.2} {...p}>
    <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.4-3 4" />
    <circle cx="12" cy="12" r="10" />
    <path d="M12 17.5v.01" />
  </svg>
);
export const IconChar = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth={2.2} {...p}>
    <path d="M4 7V5h16v2" />
    <path d="M12 5v14" />
    <path d="M8 19h8" />
  </svg>
);
export const IconReplay = (p: P) => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth={2.2} {...p}>
    <path d="M1 4v6h6M3.5 15a9 9 0 1 0 2.1-9.4L1 10" />
  </svg>
);
export const IconSlow = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M11 5v14l-9-7zM22 5v14l-9-7z" />
  </svg>
);
