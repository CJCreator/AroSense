import React from 'react';

const PrinterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a2.25 2.25 0 012.25-2.25H15a2.25 2.25 0 012.25 2.25m-2.25.096c-.24-.03-.48-.062-.72-.096m.72.096a2.25 2.25 0 002.25-2.25H9a2.25 2.25 0 00-2.25 2.25m13.5 0H3.75M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5M3.75 17.25h16.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18.75V21a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 21v-2.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75V3.75M12 3.75a2.25 2.25 0 012.25 2.25H9.75A2.25 2.25 0 0112 3.75z" />
  </svg>
);
export default PrinterIcon;