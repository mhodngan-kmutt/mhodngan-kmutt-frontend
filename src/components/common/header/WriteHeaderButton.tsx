import React from 'react';
import { EditIcon } from 'lucide-react'

interface WriteHeaderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  lang: string;
}

export default function WriteHeaderButton({
  lang,
}: WriteHeaderButtonProps) {
  return (
    <a href={lang === 'th' ? '/th/writeProject' : '/en/writeProject'}>
      <EditIcon size={24} strokeWidth={1.5} className="md:!hidden mt-0.5 mx-2 text-[var(--color-main-primary)]" />
      <button
        type="button"
        aria-label="Write Project"
        className="btn-primary !hidden md:!inline-flex items-center gap-2"
      >
        <EditIcon size={20} />
        <span className="small">Write Project</span>
      </button>
    </a>
  );
}
