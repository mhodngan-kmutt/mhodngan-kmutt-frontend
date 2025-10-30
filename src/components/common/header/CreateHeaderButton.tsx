import React from 'react';
import WriteIcon from '../../../assets/icons/writeIcon.tsx';

interface CreateHeaderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  lang: string;
}

export default function CreateHeaderButton({
  lang,
}: CreateHeaderButtonProps) {
  return (
    <a href={lang === 'th' ? '/th/create' : '/en/create'}>
      <button
        type="button"
        aria-label="Write Project"
        className="btn-primary flex items-center gap-2"
      >
        <WriteIcon className="w-5 h-5 " />
        <span className="small">New Project</span>
      </button>
    </a>
  );
}
