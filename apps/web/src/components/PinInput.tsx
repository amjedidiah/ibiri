'use client';

import { Input } from '@ibiri/components';
import { ChangeEvent, KeyboardEvent, useRef } from 'react';

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

const PinInput: React.FC<PinInputProps> = ({
  value,
  onChange,
  maxLength = 4,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = e.target.value;
    if (newValue.length <= 1 && /^\d*$/.test(newValue)) {
      const newPin = value.split('');
      newPin[index] = newValue;
      onChange(newPin.join(''));
      if (newValue.length === 1 && index < maxLength - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center space-x-2">
      {[...Array(maxLength)].map((_, index) => (
        <Input
          key={index}
          type="text"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          className="w-12 h-12 text-center text-2xl"
        />
      ))}
    </div>
  );
};

export default PinInput;
