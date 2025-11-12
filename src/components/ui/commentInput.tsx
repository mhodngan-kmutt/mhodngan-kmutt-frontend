import * as React from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentInputProps extends React.ComponentProps<'textarea'> {
  componentsColor?: string;
  onSubmit?: (comment: string) => void;
  placeholder?: string;
}

export function CommentInput({
  componentsColor = 'bg-main-background',
  className,
  onSubmit,
  placeholder = 'Write a comment...',
  ...props
}: CommentInputProps) {
  const [value, setValue] = React.useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value.trim()) return;
    
    onSubmit?.(value);
    setValue(''); // Clear input after submit
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (value.trim()) {
        onSubmit?.(value);
        setValue('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative w-full', className)}>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          placeholder={placeholder}
          className={cn(
            `w-full min-h-[80px] max-h-[200px] resize-y rounded-md ${componentsColor} px-4 py-3 pr-12 text-base shadow-xs placeholder:text-neutral-500 selection:bg-primary selection:text-primary-foreground outline-none`,
            'focus-visible:ring-neutral-500 focus-visible:ring-[2px] focus-visible:ring-offset-0',
            'hover:ring-neutral-300 hover:ring-[1px]',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          )}
          {...props}
        />
        
        {/* Submit button */}
        <button
          type="submit"
          disabled={!value.trim()}
          className={cn(
            "absolute bottom-3 right-3 flex items-center justify-center w-8 h-8 rounded-md transition-colors",
            value.trim()
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      
      {/* Helper text */}
      <p className="mt-1 text-xs text-neutral-500">
        Press Ctrl+Enter to submit
      </p>
    </form>
  );
}