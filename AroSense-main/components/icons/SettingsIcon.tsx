import React from 'react';

const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.931l.959.406c.452.192.704.646.57.992l-.71 1.964c-.134.346-.47.616-.876.616H13.5c-.405 0-.742-.27-.876-.616l-.71-1.964c-.134-.346.118-.8.57-.992l.959-.406c.396-.167.71-.507.78-.931l.149-.894z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94a8.968 8.968 0 014.314 0M2.25 12c0-2.096.943-3.991 2.457-5.321m14.586 0A8.968 8.968 0 0121.75 12M12 21.75c-2.096 0-3.991-.943-5.321-2.457m0 0A8.968 8.968 0 013.94 10.343" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
  </svg>
);
export default SettingsIcon;