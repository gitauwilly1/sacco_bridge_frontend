import React from 'react';

/**
 * Shared Bridge SVG logo mark.
 * Generates the responsive SVG arch structure consistent with the Sacco Bridge visual style.
 */
export default function BridgeLogo({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4 28 Q20 8 36 28"
        stroke="#C67B5C"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <rect
        x="10"
        y="22"
        width="3"
        height="9"
        rx="1.5"
        fill="#C67B5C"
        opacity="0.7"
      />
      <rect
        x="27"
        y="22"
        width="3"
        height="9"
        rx="1.5"
        fill="#C67B5C"
        opacity="0.7"
      />
      <rect
        x="4"
        y="27"
        width="32"
        height="3"
        rx="1.5"
        fill="#8B4513"
      />
    </svg>
  );
}
