import { useState } from 'react';

interface ToggleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string; // for aria-label
  isActive?: boolean; // optional external active state
  onActiveChange?: (active: boolean) => void; // optional callback for state changes
}

export default function ToggleButton({ label, className = '', children, isActive, onActiveChange, ...props }: ToggleButtonProps) {
  const [internalActive, setInternalActive] = useState(false);

  // Use external state if provided, otherwise use internal state
  const active = isActive !== undefined ? isActive : internalActive;

  const handleClick = () => {
    const newActive = !active;
    
    if (onActiveChange) {
      // If external control is provided, call the callback
      onActiveChange(newActive);
    } else {
      // Otherwise, update internal state
      setInternalActive(newActive);
    }
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

