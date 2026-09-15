import React from "react";

interface DirhamSymbolProps {
  className?: string;
  size?: number | string;
}

export const DirhamSymbol: React.FC<DirhamSymbolProps> = ({ 
  className = "inline-block h-[0.9em] w-auto -mt-0.5 mr-0.5 align-middle", 
  size 
}) => {
  return (
    <img 
      src="/images/aed-symbol.png" 
      alt="AED" 
      style={size ? { height: size, width: "auto" } : undefined}
      className={`inline-block select-none pointer-events-none object-contain ${className}`} 
    />
  );
};

export default DirhamSymbol;
