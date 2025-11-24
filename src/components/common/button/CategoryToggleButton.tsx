// /components/common/button/CategoryToggleButton.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import React from 'react';
import { toast } from 'sonner';

interface CategoryToggleButtonProps 
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onToggle' | 'onClick'> { 
  categoryName: string; 
  categoryId: string;
  initialActive: boolean; // Status received from parent
  onToggle: (categoryId: string) => void; // Handler to update parent state
}

export default function CategoryToggleButton({
  categoryName,
  categoryId,
  initialActive,
  onToggle,
  className = '',
  children,
  ...props
}: CategoryToggleButtonProps) {
  
  // Use local state, synchronized with initialActive from parent
  const [active, setActive] = useState(initialActive);

  // Sync internal state when parent's initialActive changes (on initial load or update)
  useEffect(() => {
    setActive(initialActive);
  }, [initialActive]);

  const handleClick = useCallback(() => {
    // 💡 Notify parent component to update the selection status in Local State/Storage
    onToggle(categoryId); 

  }, [categoryId, onToggle]);

  return (
    <button
      type="button"
      aria-label={categoryName}
      onClick={handleClick}
      className={`
        ${active 
          ? 'btn-secondary text-white' // Active state (Blue)
          : 'bg-main-white border border-main-neutral text-main-black hover:bg-main-neutral'} // Inactive state (White/Gray Border)
        px-3 py-1.5 rounded-md font-medium 
        text-sm sm:text-sm text-xs 
        transition-colors duration-200 shadow-none
        ${className}
      `}
      {...props}
    >
      {categoryName}
    </button>
  );
}