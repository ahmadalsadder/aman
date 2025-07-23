
import * as React from 'react';

const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    {...props}
  >
    <defs>
      <linearGradient id="calendar-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--chart-2))', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path
      fill="url(#calendar-gradient)"
      d="M19,4H18V2H16V4H8V2H6V4H5C3.89,4 3,4.89 3,6V20C3,21.1 3.89,22 5,22H19C20.1,22 21,21.1 21,20V6C21,4.89 20.1,4 19,4ZM19,20H5V9H19V20ZM19,7H5V6H19V7Z"
    />
  </svg>
);

export default CalendarIcon;
