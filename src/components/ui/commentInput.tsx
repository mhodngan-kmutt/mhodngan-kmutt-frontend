import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface CommentInputProps {
  placeholder?: string;
  onSubmit?: (comment: string) => Promise<void> | void;
  disabled?: boolean;
}

export function CommentInput({
  placeholder = 'Write a comment...',
  onSubmit,
  disabled = false
}: CommentInputProps) {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isSubmitting || disabled) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      if (onSubmit) {
        await onSubmit(value.trim());
        setValue('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = disabled || isSubmitting;
  const canSubmit = value.trim() && !isDisabled;

  return (
    <div class="w-full">
      <form onSubmit={handleSubmit}>
        <div class="relative">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            placeholder={placeholder}
            disabled={isDisabled}
            class="subtle w-full min-h-20 max-h-48 resize-y rounded-md bg-white px-4 py-3 pr-12 border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {canSubmit ? (
            <button
              type="submit"
              class="btn-secondary absolute bottom-3 right-3 w-8 h-8 rounded-md"
            >
              {isSubmitting ? (
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          ) : (
            <button
              type="submit"
              disabled
              class="btn-locked absolute bottom-3 right-3 w-8 h-8 rounded-md"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
      
      {error && (
        <p class="detail text-supporting-error">{error}</p>
      )}
      
      <p class="detail text-supporting-ghost">
        Press Ctrl+Enter to submit
      </p>
    </div>
  );
}