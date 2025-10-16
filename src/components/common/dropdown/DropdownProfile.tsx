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
};

export function DropdownProfile({ onLogout, name, avatarUrl }: DropdownProfileProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="btn-icon" type="button" aria-label="Profile Menu">
          <Avatar className="w-6 h-6">
            <AvatarImage src={avatarUrl || ''} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="small ml-2">{name}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-auto bg-main-white border border-main-neutral"
        align="end"
      >
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a href="/en/project" className="w-full cursor-pointer hover:bg-main-neutral">
            My Project
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={onLogout}
          className="w-full cursor-pointer text-main-primary hover:bg-main-neutral"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


