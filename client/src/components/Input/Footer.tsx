import React from 'react';
import { useGetStartupConfig } from '@librechat/data-provider';

export default function Footer() {
  const { data: config } = useGetStartupConfig();
  return (
    <div className="hidden px-3 pb-1 pt-2 text-center text-xs text-black/50 dark:text-white/50 md:block md:px-4 md:pb-4 md:pt-3">
      AI Model by{' '}
      <a href="https://openai.com/" target="_blank" rel="noopener noreferrer" className="underline">
        OpenAI
      </a>
      . Free API Keys Provided by{' '}
      <a
        href="#"
        rel="noreferrer"
        className="underline"
      >
        Secret Service
      </a>
      . Prompts by{' '}
      <a
        href="https://github.com/f/awesome-chatgpt-prompts"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        awesome-chatgpt-prompts
      </a>
      . Built by{' '}
      <a
        href="https://replit.com/@techwithanirudh"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        @techwithanirudh
      </a>
      .
    </div>
  );
}
