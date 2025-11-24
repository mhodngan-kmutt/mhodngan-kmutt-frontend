'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react'; 

export type ProjectBadge = 'Thesis' | 'Senior Project' | 'Term Project' | 'Competition';

interface DropdownBadgeProps {
  selectedBadge: string;
  onBadgeSelect: (badge: ProjectBadge) => void;
}

const BADGE_OPTIONS: ProjectBadge[] = ['Thesis', 'Senior Project', 'Term Project', 'Competition'];

export function DropdownBadge({ selectedBadge, onBadgeSelect }: DropdownBadgeProps) {
  const displayText = selectedBadge || 'Select badge';

  const triggerClassName = `
    flex items-center justify-between gap-2 p-2 h-10 shadow-sm
    border rounded-md bg-main-white border-main-neutral cursor-pointer transition-colors w-full
    ${selectedBadge 
      ? 'bg-main-white border-main-neutral text-main-text font-medium' 
      : 'bg-main-lightest border-main-light text-main-neutral-dark'
    }
  `;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={triggerClassName} type="button" aria-label="Select Project Badge">
          <span className="text-sm">{displayText}</span>
          <ChevronDown className="w-4 h-4" /> {/* แสดงไอคอนลูกศร */}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-main-white border border-main-neutral" align="end">
        {BADGE_OPTIONS.map((badge) => (
          <DropdownMenuItem
            key={badge}
            onSelect={() => onBadgeSelect(badge)}
            className={`w-full cursor-pointer hover:bg-neutral-100 ${
              selectedBadge === badge ? 'bg-neutral-50 font-semibold' : ''
            }`}
          >
            {badge}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}