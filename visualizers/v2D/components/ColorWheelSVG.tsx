import React, { useState, useCallback, useRef } from 'react';
import type { Dot, Waveform, InteractionMode } from '../../../types';

interface PathCalculationProps {
  centerX: number;
  centerY: number;
  maxRadius: number;
  waveform: Waveform;
  curvature: number;
  sineAmplitude: number;
  sineFrequency: number;
}

const getPathPoints = (
  baseAngle: number, 
  r1: number, 
  r2: number,
  props: PathCalculationProps
): { x: number, y: number }[] => {
  const { centerX, centerY, maxRadius, waveform, curvature, sineAmplitude, sineFrequency } = props;
  const points = [];
  
  if (waveform === 'spiral') {
      const numPoints = 150;
      const a = 1; 
      const b = curvature;

      if (r2 <= a || b === 0 || r1 >= r2) return [];
      
      const tMin = r1 > a ? Math.log(r1 / a) / b : 0;
      const tMax = Math.log(r2 / a) / b;
      const tMaxSystem = Math.log(maxRadius / a) / b;

      for (let i = 0; i <= numPoints; i++) {
          const t = tMin + (i / numPoints) * (tMax - tMin);
          const r = a * Math.exp(b * t);
          const finalAngle = baseAngle + (t - tMaxSystem);
          points.push({ 
              x: centerX + r * Math.cos(finalAngle), 
              y: centerY + r * Math.sin(finalAngle) 
          });
      }
  } else if (waveform === 'sine') {
      const numPoints = Math.max(150, Math.floor(100 + sineFrequency * 20 + sineAmplitude * 5));
      const ampRad = sineAmplitude * (Math.PI / 180);
      for (let i = 0; i <= numPoints; i++) {
          const r = r1 + (i / numPoints) * (r2 - r1);
          let angleOffsetVal = 0;
          if (r > 0 && maxRadius > 0) {
            const phase = (r / maxRadius) * sineFrequency * 2 * Math.PI;
            angleOffsetVal = ampRad * Math.sin(phase);
          }
          const finalAngle = baseAngle + angleOffsetVal;
          points.push({ 
              x: centerX + r * Math.cos(finalAngle), 
              y: centerY + r * Math.sin(finalAngle) 
          });
      }
  }
  return points;
}


interface SegmentProps {
  index: number;
  totalSegments: number;
  outerRadius: number;
  innerRadius?: number;
  color: string;
  pathProps: PathCalculationProps;
  opacity: number;
}

const Segment: React.FC<SegmentProps> = ({ 
  index, totalSegments, outerRadius, innerRadius = 0, color, pathProps, opacity
}) => {
  const { centerX, centerY, curvature, waveform } = pathProps;
  // Offset by -90 degrees to start at the top
  const angleOffset = -Math.PI / 2;
  const startAngle = (index / totalSegments) * 2 * Math.PI + angleOffset;
  const endAngle = ((index + 1) / totalSegments) * 2 * Math.PI + angleOffset;

  if (waveform === 'spiral' && Math.abs(curvature) < 1e-4) {
    const startPointOuter = { x: centerX + outerRadius * Math.cos(startAngle), y: centerY + outerRadius * Math.sin(startAngle) };
    const endPointOuter = { x: centerX + outerRadius * Math.cos(endAngle), y: centerY + outerRadius * Math.sin(endAngle) };
    if (innerRadius > 0) {
      const startPointInner = { x: centerX + innerRadius * Math.cos(startAngle), y: centerY + innerRadius * Math.sin(startAngle) };
      const endPointInner = { x: centerX + innerRadius * Math.cos(endAngle), y: centerY + innerRadius * Math.sin(endAngle) };
      const pathData = `
        M ${startPointInner.x},${startPointInner.y}
        L ${startPointOuter.x},${startPointOuter.y}
        A ${outerRadius},${outerRadius} 0 0 1 ${endPointOuter.x},${endPointOuter.y}
        L ${endPointInner.x},${endPointInner.y}
        A ${innerRadius},${innerRadius} 0 0 0 ${startPointInner.x},${startPointInner.y}
        Z
      `;
      return <path d={pathData} fill={color} stroke={color} fillOpacity={opacity/100} strokeWidth="1" strokeLinejoin="round" />;
    } else {
      const pathData = `M ${centerX},${centerY} L ${startPointOuter.x},${startPointOuter.y} A ${outerRadius},${outerRadius} 0 0 1 ${endPointOuter.x},${endPointOuter.y} Z`;
      return <path d={pathData} fill={color} stroke={color} fillOpacity={opacity/100} strokeWidth="1" strokeLinejoin="round" />;
    }
  }

  const points1 = getPathPoints(startAngle, innerRadius, outerRadius, pathProps);
  const points2 = getPathPoints(endAngle, innerRadius, outerRadius, pathProps);

  if (points1.length === 0 || points2.length === 0) {
      return null;
  }
  
  const pathData = `
    M ${points1[0].x} ${points1[0].y}
    L ${points1.map(p => `${p.x} ${p.y}`).join(' L ')}
    A ${outerRadius},${outerRadius} 0 0 1 ${points2[points2.length - 1].x},${points2[points2.length - 1].y}
    L ${points2.slice().reverse().map(p => `${p.x} ${p.y}`).join(' L ')}
    ${innerRadius > 0 ? `A ${innerRadius},${innerRadius} 0 0 0 ${points1[0].x},${points1[0].y}` : ''}
    Z
  `;

  return <path d={pathData} fill={color} stroke={color} fillOpacity={opacity/100} strokeWidth="1" strokeLinejoin="round" />;
};


interface ColorWheelSVGProps {
  segments: number;
  colors: string[];
  disc1Curvature: number;
  disc1Waveform: Waveform;
  disc1Opacity: number;
  disc1SineAmplitude: number;
  disc1SineFrequency: number;
  disc2Curvature: number;
  disc2Waveform: Waveform;
  disc2Opacity: number;
  disc2SineAmplitude: number;
  disc2SineFrequency: number;
  disc2Coverage: number;
  dots: Dot[];
  interactionMode: InteractionMode;
  onAddDot: (dot: Omit<Dot, 'id'>) => void;
  brushColor: string;
  animationAngles: { global: number; disc1: number; disc2: number; };
  scannerAngle: number;
}


export const ColorWheelSVG: React.FC<ColorWheelSVGProps> = (props) => {
  const { 
    segments, colors, 
    disc1Curvature, disc1Waveform, disc1Opacity, disc1SineAmplitude, disc1SineFrequency,
    disc2Curvature, disc2Waveform, disc2Opacity, disc2SineAmplitude, disc2SineFrequency,
    disc2Coverage,
    dots, interactionMode, onAddDot, brushColor,
    animationAngles, scannerAngle,
  } = props;

  const size = 600;
  const center = size / 2;
  const maxRadius = size / 2 - 20;
  
  const boundaryRadius = maxRadius * (1 - disc2Coverage / 100);
  
  const disc1OuterRadius = boundaryRadius;
  const disc2InnerRadius = boundaryRadius;
  const disc2OuterRadius = maxRadius;
  
  const [isDrawing, setIsDrawing] = useState(false);
  const currentPathIdRef = useRef<string | null>(null);

  const addDotAtMouseEvent = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (interactionMode !== 'brush' || !currentPathIdRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const svgX = (clickX / rect.width) * size;
    const svgY = (clickY / rect.height) * size;
    
    const dx = svgX - center;
    const dy = svgY - center;

    const radius = Math.sqrt(dx * dx + dy * dy);
    let angleRad = Math.atan2(dy, dx);

    if (radius > maxRadius) return;

    const currentBoundaryRadius = maxRadius * (1 - disc2Coverage / 100);
    const disc = radius <= currentBoundaryRadius ? 1 : 2;
    
    const totalRotationDeg = animationAngles.global + (disc === 1 ? animationAngles.disc1 : animationAngles.disc2);
    const totalRotationRad = totalRotationDeg * Math.PI / 180;
    
    const relativeAngle = angleRad - totalRotationRad;

    onAddDot({
        disc,
        radius,
        angle: relativeAngle,
        color: brushColor,
        pathId: currentPathIdRef.current,
    });
  }, [interactionMode, disc2Coverage, onAddDot, brushColor, maxRadius, animationAngles]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactionMode !== 'brush') return;
    setIsDrawing(true);
    const newPathId = Date.now().toString() + Math.random();
    currentPathIdRef.current = newPathId;
    addDotAtMouseEvent(e);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactionMode !== 'brush' || !isDrawing) return;
    addDotAtMouseEvent(e);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    currentPathIdRef.current = null;
  };

  const handleMouseLeave = () => {
    setIsDrawing(false);
    currentPathIdRef.current = null;
  };

  const renderPaths = (discNumber: 1 | 2) => {
    const paths = dots
      .filter(d => d.disc === discNumber)
      .reduce((acc: Record<string, Dot[]>, dot) => {
        if (!acc[dot.pathId]) {
          acc[dot.pathId] = [];
        }
        acc[dot.pathId].push(dot);
        return acc;
      }, {});

    return (Object.values(paths) as Dot[][]).map(pathDots => {
      if (pathDots.length === 0) return null;

      const points = pathDots.map(dot => {
        const cx = center + dot.radius * Math.cos(dot.angle);
        const cy = center + dot.radius * Math.sin(dot.angle);
        return `${cx},${cy}`;
      }).join(' ');

      return (
        <polyline
          key={pathDots[0].pathId}
          points={points}
          fill="none"
          stroke={pathDots[0].color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pointerEvents: 'none' }}
        />
      );
    });
  };

  const ScannerLine = () => {
    if (interactionMode !== 'scan') return null;
    const angleRad = scannerAngle * (Math.PI / 180);
    const x2 = center + maxRadius * Math.cos(angleRad);
    const y2 = center + maxRadius * Math.sin(angleRad);
    return (
       <g style={{ pointerEvents: 'none' }} filter="url(#glow)">
        <line
          x1={center}
          y1={center}
          x2={x2}
          y2={y2}
          stroke="rgba(255, 255, 255, 0.7)"
          strokeWidth="2"
        />
      </g>
    );
  };


  const disc1PathProps: PathCalculationProps = { centerX: center, centerY: center, maxRadius, waveform: disc1Waveform, curvature: disc1Curvature, sineAmplitude: disc1SineAmplitude, sineFrequency: disc1SineFrequency };
  const disc2PathProps: PathCalculationProps = { centerX: center, centerY: center, maxRadius, waveform: disc2Waveform, curvature: disc2Curvature, sineAmplitude: disc2SineAmplitude, sineFrequency: disc2SineFrequency };

  const Disc1 = disc1OuterRadius > 0.1 ? (
    <div style={{ transform: `rotate(${animationAngles.disc1}deg)` }} className="absolute top-0 left-0 w-full h-full">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
        <g>
          {Array.from({ length: segments }).map((_, i) => (
            <Segment
              key={`disc1-${i}`}
              index={i}
              totalSegments={segments}
              outerRadius={disc1OuterRadius}
              innerRadius={0}
              color={colors[i] || '#cccccc'}
              pathProps={disc1PathProps}
              opacity={disc1Opacity}
            />
          ))}
          {renderPaths(1)}
        </g>
      </svg>
    </div>
  ) : null;

  const Disc2 = disc2OuterRadius > disc2InnerRadius ? (
     <div style={{ transform: `rotate(${animationAngles.disc2}deg)` }} className="absolute w-full h-full">
        <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
          <g>
            {Array.from({ length: segments }).map((_, i) => (
              <Segment
                key={`disc2-${i}`}
                index={i}
                totalSegments={segments}
                outerRadius={disc2OuterRadius}
                innerRadius={disc2InnerRadius}
                color={colors[i] || '#cccccc'}
                pathProps={disc2PathProps}
                opacity={disc2Opacity}
              />
            ))}
            {renderPaths(2)}
          </g>
        </svg>
      </div>
  ) : null;
  

  return (
      <div 
        className="relative w-full h-full drop-shadow-2xl"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: interactionMode === 'brush' ? 'crosshair' : 'default' }}
      >
        <svg className="absolute w-full h-full overflow-visible pointer-events-none">
          <defs>
             <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>
        <div style={{ transform: `rotate(${animationAngles.global}deg)` }} className="absolute w-full h-full">
          {Disc2}
          {Disc1}
        </div>
         <svg className="absolute w-full h-full overflow-visible pointer-events-none">
          <ScannerLine />
        </svg>
      </div>
  );
};