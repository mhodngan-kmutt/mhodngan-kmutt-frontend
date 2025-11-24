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
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            placeholder={placeholder}
            disabled={isDisabled}
            className="subtle w-full min-h-20 max-h-48 resize-y rounded-md bg-white px-4 py-3 pr-12 border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {canSubmit ? (
            <button type="submit" className="btn-secondary absolute bottom-3 right-3 rounded-md flex items-center justify-center">
              <Send className="w-4 h-4 text-main-white"/>
            </button>
          ) : (
            <button type="submit" disabled className="btn-locked absolute bottom-3 right-3 rounded-md flex items-center justify-center">
              <Send className="w-4 h-4 text-supporting-ghost"/>
            </button>
          )}
        </div>
      </form>
      
      {error && (
        <p className="detail text-supporting-error">{error}</p>
      )}
    </div>
  );
}