import { ReactNode } from 'react';

export function parseMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let currentIndex = 0;
  let key = 0;

  const boldRegex = /\*\*(.*?)\*\*/g;
  const italicRegex = /\*(.*?)\*/g;
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const listRegex = /^[•\-*]\s+(.+)$/gm;

  const processedText = text.replace(boldRegex, (match, content) => {
    return `<strong>${content}</strong>`;
  }).replace(italicRegex, (match, content) => {
    return `<em>${content}</em>`;
  }).replace(linkRegex, (match, linkText, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
  });

  const lines = processedText.split('\n');

  return lines.map((line, idx) => {
    if (line.match(/^[•\-*]\s+/)) {
      const content = line.replace(/^[•\-*]\s+/, '');
      return (
        <div key={`line-${idx}`} className="flex items-start gap-2 mb-1">
          <span className="text-red-400 mt-0.5">•</span>
          <span dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      );
    }
    return (
      <div key={`line-${idx}`} dangerouslySetInnerHTML={{ __html: line || '<br/>' }} />
    );
  });
}
