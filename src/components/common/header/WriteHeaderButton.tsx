import React from 'react';
import WriteIcon from '../../../assets/icons/writeIcon.tsx';

interface WriteHeaderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  lang: string;
}

export default function WriteHeaderButton({
  lang,
}: WriteHeaderButtonProps) {
  return (
    <a href={lang === 'th' ? '/th/writeProject' : '/en/writeProject'}>
      <button
        type="button"
        aria-label="Write Project"
        className="btn-primary flex items-center gap-2"
      >
        <WriteIcon className="w-5 h-5 " />
        <span className="small">Write Project</span>
      </button>
    </a>
  );
}
