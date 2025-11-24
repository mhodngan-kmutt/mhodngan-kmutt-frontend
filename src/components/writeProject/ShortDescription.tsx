'use client';

import React, { useState, useCallback, useMemo } from 'react';

const MAX_LENGTH = 80;

interface ShortDescriptionProps {
  initialValue: string; 
  onDescriptionChange: (description: string) => void;
}

export default function ShortDescription({
  initialValue,
  onDescriptionChange,
}: ShortDescriptionProps) {
  const [description, setDescription] = useState(initialValue);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_LENGTH) {
      setDescription(value);
      onDescriptionChange(value);
    }
  }, [onDescriptionChange]);

  const remainingChars = useMemo(() => MAX_LENGTH - description.length, [description]);

  return (
    <div className="flex flex-col gap-1.5">
      <h4 className="flex items-center gap-1">
        Short description
        {/* 💡 แสดงตัวนับตัวอักษร */}
        <span 
          className={`detail ml-2 ${remainingChars < 0 ? 'text-supporting-error' : 'text-supporting-support'}`}
        >
          {description.length}/{MAX_LENGTH} characters
        </span>
      </h4>
      <textarea
        value={description}
        onChange={handleChange}
        placeholder="Add short description"
        rows={3}
        className={`
          w-full p-4 border rounded-md resize-none 
          border-main-neutral text-main-black bg-main-white 
          shadow-sm
          focus:outline-none  
          focus:ring-main-neutral focus:border-main-neutral 
          transition duration-200
        `}
      />
    </div>
  );
}