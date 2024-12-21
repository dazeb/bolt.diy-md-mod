import { IconButton } from '~/components/ui/IconButton';
import * as Popover from '@radix-ui/react-popover';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { classNames } from '~/utils/classNames';

interface URLInputProps {
  onSubmit: (url: string) => void;
  disabled?: boolean;
}

export const UrlInput = ({ onSubmit, disabled }: URLInputProps) => {
  const [url, setUrl] = useState('');
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const convertAndDownload = async (originalUrl: string) => {
    try {
      // Remove protocol if present and any trailing slashes
      const cleanUrl = originalUrl.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '');
      const jinaUrl = `https://r.jina.ai/${cleanUrl}`;

      setIsLoading(true);

      const response = await fetch(jinaUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch markdown');
      }

      const markdown = await response.text();

      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `${cleanUrl.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.md`;

      // Create and trigger download
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Markdown file downloaded successfully!');
      setOpen(false);
      setUrl('');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to convert URL to markdown');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      new URL(url); // Basic URL validation
      await convertAndDownload(url);
      onSubmit(url);
    } catch {
      toast.error('Please enter a valid URL');
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <IconButton
          title="Convert URL to Markdown"
          disabled={disabled}
          className="bg-bolt-elements-item-backgroundDefault text-bolt-elements-item-contentDefault"
        >
          <div className="i-ph:globe text-xl" />
        </IconButton>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="bg-bolt-elements-background-depth-2 rounded-lg p-4 shadow-lg border border-bolt-elements-borderColor z-[9999]"
          sideOffset={5}
          align="center"
          side="top"
          style={{ zIndex: 9999 }}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <input
              type="text"
              value={url}
              onChange={handleInput}
              placeholder="Enter URL to convert..."
              className={classNames(
                'w-64 px-3 py-1.5 rounded-md',
                'bg-bolt-elements-background-depth-3',
                'border border-bolt-elements-borderColor',
                'text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary',
                'focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus',
              )}
            />
            <button type="submit" disabled={!url.trim() || isLoading} className="p-0">
              <IconButton
                disabled={!url.trim() || isLoading}
                className={classNames(
                  'bg-bolt-elements-button-primary-background',
                  'text-bolt-elements-button-primary-text',
                  'hover:bg-bolt-elements-button-primary-backgroundHover',
                  'disabled:opacity-50',
                )}
              >
                {isLoading ? (
                  <div className="i-svg-spinners:90-ring-with-bg text-xl animate-spin" />
                ) : (
                  <div className="i-ph:arrow-right text-xl" />
                )}
              </IconButton>
            </button>
          </form>
          <Popover.Arrow className="fill-bolt-elements-background-depth-2" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
