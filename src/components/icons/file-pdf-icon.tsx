import * as React from 'react';

export const FilePdfIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9.8 17.1H7.5v-4.2h2.3c.8 0 1.5.7 1.5 1.5v1.2c0 .8-.7 1.5-1.5 1.5z" />
    <path d="M16.5 12.9H14v4.2h1.2c.8 0 1.5-.7 1.5-1.5v-1.2c0-.8-.7-1.5-1.5-1.5z" />
    <path d="M12.5 12.9v4.2" />
  </svg>
);
