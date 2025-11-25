import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchbarProps extends React.ComponentProps<'input'> {
  componentsColor?: string;
  classname?: string;
  lang: string;
}

export function Searchbar({
  componentsColor,
  className,
  lang,
  ...props
}: SearchbarProps) {
  const [value, setValue] = React.useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value) return;
    window.location.href = `/${lang}/project?q=${encodeURIComponent(value)}`;
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative w-full', className)}>
      {/* Clickable Search icon */}
      <button
        type="submit"
        className="absolute inset-y-0 left-0 flex items-center justify-center my-2.5 !px-3 lg:!px-4 text-muted-foreground hover:text-neutral-800"
      >
        <Search className="w-5 h-5 text-neutral-500 hover:text-neutral-800" />
      </button>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={cn(
          `w-full max-w-100 h-10 rounded-md bg-${componentsColor} pl-10 pr-3 py-1 text-base shadow-xs placeholder:text-neutral-500 selection:bg-primary selection:text-primary-foreground outline-none`,
          'focus-visible:ring-neutral-500 focus-visible:ring-[2px] focus-visible:ring-offset-0',
          'hover:ring-neutral-300 hover:ring-[1px]',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        )}
        {...props}
      />
    </form>
  );
}
