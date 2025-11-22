'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type DropdownProfileProps = {
  onLogout: () => void;
  name: string;
  avatarUrl?: string | null;
  userRole?: string;
};

export function DropdownProfile({ onLogout, name, avatarUrl, userRole }: DropdownProfileProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="btn-icon" type="button" aria-label="Profile Menu">
          <Avatar className="w-10 h-10 md:w-6 md:h-6">
            <AvatarImage src={avatarUrl || ''} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="hidden md:inline-block ml-2 small">{name}</span> {/* This will hide the name on small screens */}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-auto bg-main-white border border-main-neutral" align="end">
        {userRole === 'contributor' && (
          <DropdownMenuItem asChild>
            <a href="/en/project/me" className="w-full cursor-pointer hover:bg-neutral-100">
              My Project
            </a>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onSelect={onLogout}
          className="w-full cursor-pointer text-main-primary hover:bg-neutral-100"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
