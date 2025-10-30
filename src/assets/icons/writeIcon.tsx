import React from 'react';

export default function WriteIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
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
      <g clipPath="url(#clip0_997_6270)">
        <path
          d="M9.16669 3.33325H3.33335C2.89133 3.33325 2.4674 3.50885 2.15484 3.82141C1.84228 4.13397 1.66669 4.55789 1.66669 4.99992V16.6666C1.66669 17.1086 1.84228 17.5325 2.15484 17.8451C2.4674 18.1577 2.89133 18.3333 3.33335 18.3333H15C15.442 18.3333 15.866 18.1577 16.1785 17.8451C16.4911 17.5325 16.6667 17.1086 16.6667 16.6666V10.8333"
          stroke="#E5E5E5"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.4167 2.08344C15.7482 1.75192 16.1978 1.56567 16.6667 1.56567C17.1355 1.56567 17.5852 1.75192 17.9167 2.08344C18.2482 2.41496 18.4345 2.8646 18.4345 3.33344C18.4345 3.80228 18.2482 4.25192 17.9167 4.58344L10 12.5001L6.66669 13.3334L7.50002 10.0001L15.4167 2.08344Z"
          stroke="#E5E5E5"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_997_6270">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
