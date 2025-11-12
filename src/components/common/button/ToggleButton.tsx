import { useState } from 'react';

interface ToggleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string; // for aria-label
}

export default function ToggleButton({ label, className = '', children, ...props }: ToggleButtonProps) {
  const [active, setActive] = useState(false);

  const handleClick = () => {
    setActive(!active);
  };

  return (
    <button
      type="button"
      aria-label={label}
      onClick={handleClick}
      className={`${active ? 'btn-secondary' : 'btn-icon'} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
