import { CopilotTextarea } from '@copilotkit/react-textarea';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface CustomCopilotTextareaProps {
  placeholder: string;
  textareaPurpose: string;
  maxTokens?: number;
  defaultValue?: string;
  debounceDuration?: number;
  onDebouncedUpdate?: (value: string) => void;
  className?: string;
}

export function CustomCopilotTextarea({
  placeholder,
  textareaPurpose,
  maxTokens,
  defaultValue,
  debounceDuration,
  onDebouncedUpdate,
  className,
}: CustomCopilotTextareaProps) {
  const [text, setText] = useState(defaultValue || '');

  // debounce the update
  let timeout = useRef<any>(null);

  const debouncedUpdate = (value: string) => {
    timeout.current && clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      onDebouncedUpdate?.(value);
    }, debounceDuration || 750);
  };

  // update the value
  const handleValueChange = (value: string) => {
    setText(value);
    debouncedUpdate(value);
  };

  return (
    <CopilotTextarea
      className={cn('w-full h-full p-4 overflow-hidden', className)}
      value={text}
      onValueChange={handleValueChange}
      placeholder={placeholder}
      autosuggestionsConfig={{
        textareaPurpose,
        chatApiConfigs: {
          suggestionsApiConfig: {
            forwardedParams: {
              max_tokens: maxTokens || 50,
              stop: ['.', '?', '!'],
            },
          },
        },
      }}
    />
  );
}
