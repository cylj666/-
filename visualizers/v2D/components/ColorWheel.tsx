import React, { useState, useRef, useCallback } from 'react';
import { ColorWheelSVG } from './ColorWheelSVG';
import type { Dot, Waveform, InteractionMode } from '../../../types';

export interface ColorWheelProps {
  segments: number;
  colors: string[];
  disc1Curvature: number;
  disc1Waveform: Waveform;
  disc1Opacity: number;
  disc1SineAmplitude: number;
  disc1SineFrequency: number;
  disc1PhaseRange: number;
  disc1PhaseSpeed: number;
  disc2Curvature: number;
  disc2Waveform: Waveform;
  disc2Opacity: number;
  disc2SineAmplitude: number;
  disc2SineFrequency: number;
  disc2PhaseRange: number;
  disc2PhaseSpeed: number;
  disc1RotationSpeed: number;
  disc1RotationDirection: 'clockwise' | 'counter-clockwise';
  disc1BaseRotation: number;
  disc2RotationSpeed: number;
  disc2RotationDirection: 'clockwise' | 'counter-clockwise';
  disc2BaseRotation: number;
  disc2Coverage: number;
  globalRotationSpeed: number;
  globalRotationDirection: 'clockwise' | 'counter-clockwise';
  dots: Dot[];
  interactionMode: InteractionMode;
  onAddDot: (dot: Omit<Dot, 'id'>) => void;
  animationAngles: { global: number; disc1: number; disc2: number; };
  zoom: number;
  setZoom: (z: number) => void;
  brushColor: string;
  panOffset: { x: number; y: number; };
  setPanOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number; }>>;
  scannerAngle: number;
  setScannerAngle: (a: number) => void;
}

export const ColorWheel: React.FC<ColorWheelProps> = (props) => {
  const { zoom, setZoom, panOffset, setPanOffset, interactionMode, setScannerAngle, ...rest } = props;
  const [isPanning, setIsPanning] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const initialPinchDistanceRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(zoom);
  const svgWrapperRef = useRef<HTMLDivElement>(null);

  const getDistance = (touches: React.TouchList) => {
    const [touch1, touch2] = [touches[0], touches[1]];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleScan = useCallback((clientX: number, clientY: number) => {
    const wrapper = svgWrapperRef.current;
    if (!wrapper) return;
    
    const rect = wrapper.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180 / Math.PI + 360) % 360; // Convert to degrees 0-360
    setScannerAngle(angleDeg);

  }, [setScannerAngle]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (interactionMode === 'scan') {
      setIsScanning(true);
      handleScan(e.touches[0].clientX, e.touches[0].clientY);
      return;
    }
    if (interactionMode !== 'pan') return;

    if (e.touches.length === 1) {
      setIsPanning(true);
      setDragStart({
        x: e.touches[0].clientX - panOffset.x,
        y: e.touches[0].clientY - panOffset.y,
      });
    } else if (e.touches.length === 2) {
      e.preventDefault();
      initialPinchDistanceRef.current = getDistance(e.touches);
      initialZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (interactionMode === 'scan' && isScanning) {
       handleScan(e.touches[0].clientX, e.touches[0].clientY);
       return;
    }
    if (interactionMode !== 'pan') return;

    if (e.touches.length === 1 && isPanning) {
      setPanOffset({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && initialPinchDistanceRef.current !== null) {
      e.preventDefault();
      const newDistance = getDistance(e.touches);
      const zoomFactor = newDistance / initialPinchDistanceRef.current;
      const newZoom = initialZoomRef.current * zoomFactor;
      setZoom(Math.max(0.2, Math.min(10, newZoom)));
    }
  };

  const handleTouchEnd = () => {
    setIsScanning(false);
    if (interactionMode !== 'pan') return;
    setIsPanning(false);
    initialPinchDistanceRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactionMode === 'scan') {
      setIsScanning(true);
      handleScan(e.clientX, e.clientY);
      return;
    }
    if (interactionMode !== 'pan' || e.button !== 0) return;
    e.preventDefault();
    setIsPanning(true);
    setDragStart({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
     if (interactionMode === 'scan' && isScanning) {
      handleScan(e.clientX, e.clientY);
      return;
    }
    if (interactionMode !== 'pan' || !isPanning) return;
    e.preventDefault();
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUpOrLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScanning(false);
    if (isPanning) {
      e.preventDefault();
      setIsPanning(false);
    }
  };
  
  const getCursor = () => {
    if (interactionMode === 'scan') return 'pointer';
    if (interactionMode === 'brush') return undefined; // Let SVG handle its own cursor
    if (isPanning) return 'grabbing';
    return 'grab';
  };

  return (
    <div 
      className="w-full h-full overflow-hidden touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: getCursor() }}
    >
      <div className="grid place-items-center w-full h-full p-4">
        <div 
          ref={svgWrapperRef}
          className="w-full max-w-[600px] aspect-square"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
            transformOrigin: 'center',
            transition: isPanning ? 'none' : 'transform 0.15s ease-in-out',
          }}
        >
          <ColorWheelSVG {...rest} interactionMode={interactionMode} />
        </div>
      </div>
    </div>
  );
};