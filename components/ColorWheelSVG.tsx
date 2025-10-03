import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Dot, Waveform } from '../types';

interface SegmentProps {
  index: number;
  totalSegments: number;
  outerRadius: number;
  innerRadius?: number;
  centerX: number;
  centerY: number;
  curvature: number;
  color: string;
  maxRadius: number;
  waveform: Waveform;
  opacity: number;
  sineAmplitude: number;
  sineFrequency: number;
}

const Segment: React.FC<SegmentProps> = ({ 
  index, totalSegments, outerRadius, innerRadius = 0, centerX, centerY, curvature, color, maxRadius,
  waveform, opacity, sineAmplitude, sineFrequency
}) => {
  // Offset by -90 degrees to start at the top
  const angleOffset = -Math.PI / 2;
  const startAngle = (index / totalSegments) * 2 * Math.PI + angleOffset;
  const endAngle = ((index + 1) / totalSegments) * 2 * Math.PI + angleOffset;

  const startPointOuter = { x: centerX + outerRadius * Math.cos(startAngle), y: centerY + outerRadius * Math.sin(startAngle) };
  const endPointOuter = { x: centerX + outerRadius * Math.cos(endAngle), y: centerY + outerRadius * Math.sin(endAngle) };

  const getPathPoints = (
    baseAngle: number, 
    r1: number, 
    r2: number,
  ): { x: number, y: number }[] => {
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
  
  if (waveform === 'spiral' && Math.abs(curvature) < 1e-4) {
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

  const points1 = getPathPoints(startAngle, innerRadius, outerRadius);
  const points2 = getPathPoints(endAngle, innerRadius, outerRadius);

  if (points1.length === 0 || points2.length === 0) {
      if (innerRadius <= 0) {
        return <path d={`M ${centerX},${centerY} L ${startPointOuter.x},${startPointOuter.y} A ${outerRadius},${outerRadius} 0 0 1 ${endPointOuter.x},${endPointOuter.y} Z`} fill={color} stroke={color} fillOpacity={opacity/100} strokeWidth="1" strokeLinejoin="round" />;
      }
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
  masterRotationSpeed: number;
  masterRotationDirection: 'clockwise' | 'counter-clockwise';
  dots: Dot[];
  isBrushMode: boolean;
  onAddDot: (dot: Omit<Dot, 'id'>) => void;
  brushColor: string;
}


export const ColorWheelSVG: React.FC<ColorWheelSVGProps> = (props) => {
  const { 
    segments, colors, 
    disc1Curvature, disc1Waveform, disc1Opacity, disc1SineAmplitude, disc1SineFrequency, disc1PhaseRange, disc1PhaseSpeed,
    disc2Curvature, disc2Waveform, disc2Opacity, disc2SineAmplitude, disc2SineFrequency, disc2PhaseRange, disc2PhaseSpeed,
    disc1RotationSpeed, disc1RotationDirection, disc1BaseRotation,
    disc2RotationSpeed, disc2RotationDirection, disc2BaseRotation,
    disc2Coverage,
    globalRotationSpeed, globalRotationDirection,
    masterRotationSpeed, masterRotationDirection,
    dots, isBrushMode, onAddDot, brushColor,
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
  const masterWrapperRef = useRef<HTMLDivElement>(null);
  const globalWrapperRef = useRef<HTMLDivElement>(null);
  const disc1WrapperRef = useRef<HTMLDivElement>(null);
  const disc2WrapperRef = useRef<HTMLDivElement>(null);

  // FIX: Initialize useRef with null for better type safety and to match common React patterns.
  // The error on line 186 is likely misleading and caused by this unconventional useRef usage.
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  useEffect(() => {
    startTimeRef.current = performance.now(); // Reset start time on any parameter change
    
    const animate = (timestamp: number) => {
      const elapsedTime = (timestamp - startTimeRef.current) / 1000; // in seconds

      const masterSign = masterRotationDirection === 'clockwise' ? 1 : -1;
      const masterAngle = masterRotationSpeed * 360 * elapsedTime * masterSign;
      
      const globalSign = globalRotationDirection === 'clockwise' ? 1 : -1;
      const globalAngle = globalRotationSpeed * 360 * elapsedTime * globalSign;
      
      const disc1Sign = disc1RotationDirection === 'clockwise' ? 1 : -1;
      const disc1BaseAngle = disc1BaseRotation + disc1RotationSpeed * 360 * elapsedTime * disc1Sign;
      const disc1PhaseOffset = disc1PhaseRange * Math.sin(elapsedTime * disc1PhaseSpeed * 2 * Math.PI);
      const disc1TotalAngle = disc1BaseAngle + disc1PhaseOffset;
      
      const disc2Sign = disc2RotationDirection === 'clockwise' ? 1 : -1;
      const disc2BaseAngle = disc2BaseRotation + disc2RotationSpeed * 360 * elapsedTime * disc2Sign;
      const disc2PhaseOffset = disc2PhaseRange * Math.sin(elapsedTime * disc2PhaseSpeed * 2 * Math.PI);
      const disc2TotalAngle = disc2BaseAngle + disc2PhaseOffset;

      if (masterWrapperRef.current) masterWrapperRef.current.style.transform = `rotate(${masterAngle}deg)`;
      if (globalWrapperRef.current) globalWrapperRef.current.style.transform = `rotate(${globalAngle}deg)`;
      if (disc1WrapperRef.current) {
        disc1WrapperRef.current.style.transform = `rotate(${disc1TotalAngle}deg)`;
      }
      if (disc2WrapperRef.current) {
        disc2WrapperRef.current.style.transform = `rotate(${disc2TotalAngle}deg)`;
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    disc1RotationSpeed, disc1RotationDirection, disc1BaseRotation, disc1PhaseRange, disc1PhaseSpeed,
    disc2RotationSpeed, disc2RotationDirection, disc2BaseRotation, disc2PhaseRange, disc2PhaseSpeed,
    globalRotationSpeed, globalRotationDirection,
    masterRotationSpeed, masterRotationDirection
  ]);


  const addDotAtMouseEvent = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isBrushMode || !currentPathIdRef.current) return;

    const getRotationAngle = (element: HTMLElement | null): number => {
      if (!element) return 0;
      const transform = element.style.transform;
      if (!transform.includes('rotate')) return 0;
      const angle = parseFloat(transform.split('(')[1].split('deg')[0]);
      return isNaN(angle) ? 0 : angle;
    };

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
    
    const masterAnimAngle = getRotationAngle(masterWrapperRef.current);
    const globalAnimAngle = getRotationAngle(globalWrapperRef.current);
    const discAnimAngle = getRotationAngle(disc === 1 ? disc1WrapperRef.current : disc2WrapperRef.current);

    const totalRotationDeg = masterAnimAngle + globalAnimAngle + discAnimAngle;
    const totalRotationRad = totalRotationDeg * Math.PI / 180;
    
    const relativeAngle = angleRad - totalRotationRad;

    onAddDot({
        disc,
        radius,
        angle: relativeAngle,
        color: brushColor,
        pathId: currentPathIdRef.current,
    });
  }, [isBrushMode, disc2Coverage, onAddDot, brushColor, maxRadius]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isBrushMode) return;
    setIsDrawing(true);
    const newPathId = Date.now().toString() + Math.random();
    currentPathIdRef.current = newPathId;
    addDotAtMouseEvent(e);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isBrushMode || !isDrawing) return;
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

  // FIX: Type the accumulator in `reduce` and cast the result of `Object.values`
  // to resolve type inference issues with these methods in the current environment.
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

  const Disc1 = disc1OuterRadius > 0.1 ? (
    <div ref={disc1WrapperRef} className="absolute top-0 left-0 w-full h-full">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
        <g>
          {Array.from({ length: segments }).map((_, i) => (
            <Segment
              key={`disc1-${i}`}
              index={i}
              totalSegments={segments}
              outerRadius={disc1OuterRadius}
              innerRadius={0}
              centerX={center}
              centerY={center}
              curvature={disc1Curvature}
              color={colors[i] || '#cccccc'}
              maxRadius={maxRadius}
              waveform={disc1Waveform}
              opacity={disc1Opacity}
              sineAmplitude={disc1SineAmplitude}
              sineFrequency={disc1SineFrequency}
            />
          ))}
          {renderPaths(1)}
        </g>
      </svg>
    </div>
  ) : null;

  const Disc2 = disc2OuterRadius > disc2InnerRadius ? (
     <div ref={disc2WrapperRef} className="absolute w-full h-full">
        <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
          <g>
            {Array.from({ length: segments }).map((_, i) => (
              <Segment
                key={`disc2-${i}`}
                index={i}
                totalSegments={segments}
                outerRadius={disc2OuterRadius}
                innerRadius={disc2InnerRadius}
                centerX={center}
                centerY={center}
                curvature={disc2Curvature}
                color={colors[i] || '#cccccc'}
                maxRadius={maxRadius}
                waveform={disc2Waveform}
                opacity={disc2Opacity}
                sineAmplitude={disc2SineAmplitude}
                sineFrequency={disc2SineFrequency}
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
        style={{ cursor: isBrushMode ? 'crosshair' : 'default' }}
      >
        <div ref={masterWrapperRef} className="absolute w-full h-full">
          <div ref={globalWrapperRef} className="absolute w-full h-full">
            {Disc2}
            {Disc1}
          </div>
        </div>
      </div>
  );
};