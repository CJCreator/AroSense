import React from 'react';

const BabyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75s.168-.75.375-.75S9.75 9.336 9.75 9.75zm4.5 0c0 .414-.168.75-.375.75S13.5 10.164 13.5 9.75s.168-.75.375-.75S14.25 9.336 14.25 9.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 12.75c.071.03.14.062.21.096M12.75 12.75A4.509 4.509 0 0112 12.518a4.509 4.509 0 01-.75.232m1.5-.464A4.5 4.5 0 0012 12.25a4.5 4.5 0 00-.75.268" />
  </svg>
);
export default BabyIcon;