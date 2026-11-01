import React from 'react';

interface BappenasLogoProps {
  className?: string;
  imgClassName?: string;
}

export const BappenasLogo: React.FC<BappenasLogoProps> = ({
  className = '',
  imgClassName = 'h-14 w-auto object-contain',
}) => {
  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src="/assets/aistudio/image_371bd17e.png"
        alt="Logo Bappenas - Kementerian Perencanaan Pembangunan Nasional / Badan Perencanaan Pembangunan Nasional"
        className={imgClassName}
        loading="eager"
      />
    </div>
  );
};
