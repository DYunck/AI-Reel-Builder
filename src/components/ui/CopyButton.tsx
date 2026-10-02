import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/Button';
import { copyToClipboard } from '@/lib/utils';

export function CopyButton({ text, label = 'Copy', ...props }: { text: string; label?: string } & Omit<ButtonProps, 'onClick'>) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="secondary"
      size="sm"
      icon={copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
      onClick={async () => {
        if (await copyToClipboard(text)) {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }
      }}
      disabled={!text}
      {...props}
    >
      {copied ? 'Copied!' : label}
    </Button>
  );
}
