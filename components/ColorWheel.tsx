import React, { useState } from 'react';
import { ColorWheelSVG } from './ColorWheelSVG';
import type { Dot } from '../types';

export interface ColorWheelProps {
  segments: number;
  colors: string[];
  disc1Curvature: number;
  disc2Curvature: number;
  disc1RotationSpeed: number;
  disc1RotationDirection: 'clockwise' | 'counter-clockwise';
  disc1BaseRotation: number;
  disc2RotationSpeed: number;
  disc2RotationDirection: 'clockwise' | 'counter-clockwise';
  disc2BaseRotation: number;
  disc2Coverage: number;
  globalRotationSpeed: number;
  globalRotationDirection: 'clockwise' | 'counter-clockwise';
  masterRotationSpeed: number;
  masterRotationDirection: 'clockwise' | 'counter-clockwise';
  dots: Dot[];
  isBrushMode: boolean;
  onAddDot: (dot: Omit<Dot, 'id'>) => void;
  zoom: number;
  brushColor: string;
  panOffset: { x: number; y: number; };
  setPanOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number; }>>;
}

export const ColorWheel: React.FC<ColorWheelProps> = (props) => {
  const { zoom, panOffset, setPanOffset, isBrushMode, ...rest } = props;
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only pan in non-brush mode, with left click
    if (isBrushMode || e.button !== 0) return;
    e.preventDefault();
    setIsPanning(true);
    setDragStart({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    e.preventDefault();
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUpOrLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      e.preventDefault();
      setIsPanning(false);
    }
  };
  
  const getCursor = () => {
    if (isBrushMode) return undefined; // Let SVG handle its own cursor
    if (isPanning) return 'grabbing';
    return 'grab';
  };

  return (
    <div 
      className="w-full h-full overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      style={{ cursor: getCursor() }}
    >
      <div className="grid place-items-center min-w-full min-h-full p-4">
        <div style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          transformOrigin: 'center',
          transition: isPanning ? 'none' : 'transform 0.15s ease-in-out',
        }}>
          <ColorWheelSVG {...rest} isBrushMode={isBrushMode} />
        </div>
      </div>
    </div>
  );
};
