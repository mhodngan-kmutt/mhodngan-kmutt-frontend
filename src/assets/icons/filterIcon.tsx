import React from 'react';

export default function FilterIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M16.6667 5.8335H9.16669"
        stroke="#262626"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.6667 14.1665H4.16669"
        stroke="#262626"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.1667 16.6665C15.5474 16.6665 16.6667 15.5472 16.6667 14.1665C16.6667 12.7858 15.5474 11.6665 14.1667 11.6665C12.786 11.6665 11.6667 12.7858 11.6667 14.1665C11.6667 15.5472 12.786 16.6665 14.1667 16.6665Z"
        stroke="#262626"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.83331 8.3335C7.21402 8.3335 8.33331 7.21421 8.33331 5.8335C8.33331 4.45278 7.21402 3.3335 5.83331 3.3335C4.4526 3.3335 3.33331 4.45278 3.33331 5.8335C3.33331 7.21421 4.4526 8.3335 5.83331 8.3335Z"
        stroke="#262626"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
