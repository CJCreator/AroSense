import React from 'react';

interface QRCodeGeneratorProps {
  data: string;
  size?: number;
  className?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ data, size = 200, className = '' }) => {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img 
        src={qrCodeUrl} 
        alt="QR Code" 
        className="border border-gray-300 rounded-lg"
        width={size}
        height={size}
      />
      <p className="text-xs text-gray-500 mt-2 text-center max-w-xs">
        Scan with any QR code reader to access emergency information
      </p>
    </div>
  );
};

export default QRCodeGenerator;