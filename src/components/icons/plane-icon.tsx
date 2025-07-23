import * as React from 'react';

const PlaneIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" {...props}>
    <defs>
      <linearGradient id="plane-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--primary) / 0.5)', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path
      fill="url(#plane-gradient)"
      d="M22.2,8.6c0-0.4-0.4-0.8-0.8-0.8h-4.8L12.9,3c-0.2-0.2-0.5-0.3-0.8-0.3c-0.3,0-0.6,0.1-0.8,0.3L7.6,7.8H2.6 c-0.4,0-0.8,0.4-0.8,0.8v0.2L8.5,12l-6.7,3.2v0.2c0,0.4,0.4,0.8,0.8,0.8h4.8l3.7,4.8c0.2,0.2,0.5,0.3,0.8,0.3c0.3,0,0.6-0.1,0.8-0.3 l3.7-4.8h4.8c0.4,0,0.8-0.4,0.8-0.8v-0.2L15.3,12l6.7-3.2V8.6z"
    />
  </svg>
);

export default PlaneIcon;
