import React, { useState, useCallback, useRef } from 'react';
import type { Dot } from '../types';

interface SegmentProps {
  index: number;
  totalSegments: number;
  outerRadius: number;
  innerRadius?: number;
  centerX: number;
  centerY: number;
  curvature: number;
  color: string;
  maxRadius: number; // For consistent spiral calculations
}

const Segment: React.FC<SegmentProps> = ({ 
  index, totalSegments, outerRadius, innerRadius = 0, centerX, centerY, curvature, color, maxRadius
}) => {
  // Offset by -90 degrees to start at the top
  const angleOffset = -Math.PI / 2;
  const startAngle = (index / totalSegments) * 2 * Math.PI + angleOffset;
  const endAngle = ((index + 1) / totalSegments) * 2 * Math.PI + angleOffset;

  const startPointOuter = { x: centerX + outerRadius * Math.cos(startAngle), y: centerY + outerRadius * Math.sin(startAngle) };
  const endPointOuter = { x: centerX + outerRadius * Math.cos(endAngle), y: centerY + outerRadius * Math.sin(endAngle) };
  
  if (Math.abs(curvature) < 1e-4) {
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
      return <path d={pathData} fill={color} stroke={color} strokeWidth="2" strokeLinejoin="round" />;
    } else {
      const pathData = `M ${centerX},${centerY} L ${startPointOuter.x},${startPointOuter.y} A ${outerRadius},${outerRadius} 0 0 1 ${endPointOuter.x},${endPointOuter.y} Z`;
      return <path d={pathData} fill={color} stroke={color} strokeWidth="2" strokeLinejoin="round" />;
    }
  }

  const getSpiralPoints = (baseAngle: number, r1: number, r2: number): { x: number, y: number }[] => {
    const points = [];
    const a = 1; // Base radius for spiral formula, can be any positive constant
    const b = curvature;

    // Prevent division by zero and handle cases where radii are invalid
    if (r2 <= a || b === 0 || r1 >= r2) return [];
    
    // Calculate the parameter 't' for the spiral equation r = a * e^(b*t)
    const tMin = r1 > a ? Math.log(r1 / a) / b : 0;
    const tMax = Math.log(r2 / a) / b;
    // This is the key fix: use a consistent reference point (maxRadius) for the angle calculation
    // to ensure continuity between adjacent segments (like Disc 1 and Disc 2).
    const tMaxSystem = Math.log(maxRadius / a) / b;

    const pointsPerRotation = 200;
    const dynamicPoints = Math.ceil((Math.abs(tMax - tMin) / (2 * Math.PI)) * pointsPerRotation);
    const numPoints = Math.min(1500, Math.max(50, dynamicPoints));

    for (let i = 0; i <= numPoints; i++) {
        const t = tMin + (i / numPoints) * (tMax - tMin);
        const r = a * Math.exp(b * t);
        // The angle is calculated relative to the spiral's position at the entire wheel's max radius
        const finalAngle = baseAngle + (t - tMaxSystem);
        const x = centerX + r * Math.cos(finalAngle);
        const y = centerY + r * Math.sin(finalAngle);
        points.push({ x, y });
    }
    return points;
  };

  const points1 = getSpiralPoints(startAngle, innerRadius, outerRadius);
  const points2 = getSpiralPoints(endAngle, innerRadius, outerRadius);

  if (points1.length === 0 || points2.length === 0) {
      if (innerRadius <= 0) {
        return <path d={`M ${centerX},${centerY} L ${startPointOuter.x},${startPointOuter.y} A ${outerRadius},${outerRadius} 0 0 1 ${endPointOuter.x},${endPointOuter.y} Z`} fill={color} stroke={color} strokeWidth="2" strokeLinejoin="round" />;
      }
      return null; // Return nothing if we can't draw the spiral and it's a hollow segment
  }
  
  const pathData = `
    M ${points1[0].x} ${points1[0].y}
    L ${points1.map(p => `${p.x} ${p.y}`).join(' L ')}
    A ${outerRadius},${outerRadius} 0 0 1 ${points2[points2.length - 1].x},${points2[points2.length - 1].y}
    L ${points2.slice().reverse().map(p => `${p.x} ${p.y}`).join(' L ')}
    ${innerRadius > 0 ? `A ${innerRadius},${innerRadius} 0 0 0 ${points1[0].x},${points1[0].y}` : ''}
    Z
  `;

  return <path d={pathData} fill={color} stroke={color} strokeWidth="2" strokeLinejoin="round" />;
};


interface ColorWheelSVGProps {
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
  brushColor: string;
}


export const ColorWheelSVG: React.FC<ColorWheelSVGProps> = ({ 
  segments, colors, 
  disc1Curvature, disc2Curvature,
  disc1RotationSpeed, disc1RotationDirection, disc1BaseRotation,
  disc2RotationSpeed, disc2RotationDirection, disc2BaseRotation,
  disc2Coverage,
  globalRotationSpeed, globalRotationDirection,
  masterRotationSpeed, masterRotationDirection,
  dots, isBrushMode, onAddDot, brushColor,
}) => {
  const size = 600;
  const center = size / 2;
  const maxRadius = size / 2 - 20;
  
  const boundaryRadius = maxRadius * (1 - disc2Coverage / 100);
  
  const disc1OuterRadius = boundaryRadius;
  const disc2InnerRadius = boundaryRadius;
  const disc2OuterRadius = maxRadius;

  const disc1AnimationDuration = disc1RotationSpeed > 0 ? 1 / disc1RotationSpeed : 0;
  const disc2AnimationDuration = disc2RotationSpeed > 0 ? 1 / disc2RotationSpeed : 0;
  const globalAnimationDuration = globalRotationSpeed > 0 ? 1 / globalRotationSpeed : 0;
  const masterAnimationDuration = masterRotationSpeed > 0 ? 1 / masterRotationSpeed : 0;

  const disc1WheelStyle: React.CSSProperties = {
    animationName: disc1AnimationDuration > 0 ? 'spin' : 'none',
    animationDuration: `${disc1AnimationDuration}s`,
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    animationDirection: disc1RotationDirection === 'clockwise' ? 'normal' : 'reverse',
  };

  const disc2WheelStyle: React.CSSProperties = {
    animationName: disc2AnimationDuration > 0 ? 'spin' : 'none',
    animationDuration: `${disc2AnimationDuration}s`,
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    animationDirection: disc2RotationDirection === 'clockwise' ? 'normal' : 'reverse',
  };

  const globalWheelStyle: React.CSSProperties = {
    animationName: globalAnimationDuration > 0 ? 'spin' : 'none',
    animationDuration: `${globalAnimationDuration}s`,
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    animationDirection: globalRotationDirection === 'clockwise' ? 'normal' : 'reverse',
  };

  const masterWheelStyle: React.CSSProperties = {
    animationName: masterAnimationDuration > 0 ? 'spin' : 'none',
    animationDuration: `${masterAnimationDuration}s`,
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    animationDirection: masterRotationDirection === 'clockwise' ? 'normal' : 'reverse',
  };
  
  const [isDrawing, setIsDrawing] = useState(false);
  const currentPathIdRef = useRef<string | null>(null);
  const masterWrapperRef = useRef<HTMLDivElement>(null);
  const globalWrapperRef = useRef<HTMLDivElement>(null);
  const disc1WrapperRef = useRef<HTMLDivElement>(null);
  const disc2WrapperRef = useRef<HTMLDivElement>(null);


  const addDotAtMouseEvent = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isBrushMode || !currentPathIdRef.current) return;

    const getRotationAngle = (element: HTMLElement | null): number => {
      if (!element) return 0;
      const style = window.getComputedStyle(element);
      const transform = style.transform;
      if (transform === 'none') return 0;
      try {
        const matrix = new DOMMatrix(transform);
        return Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
      } catch (e) {
        return 0;
      }
    };

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const svgX = (clickX / rect.width) * size;
    const svgY = (clickY / rect.height) * size;
    
    const dx = svgX - center;
    const dy = svgY - center;

    const radius = Math.sqrt(dx * dx + dy * dy);
    const angleRad = Math.atan2(dy, dx);

    if (radius > maxRadius) return;

    const currentBoundaryRadius = maxRadius * (1 - disc2Coverage / 100);
    const disc = radius <= currentBoundaryRadius ? 1 : 2;
    
    const masterAnimAngle = getRotationAngle(masterWrapperRef.current);
    const globalAnimAngle = getRotationAngle(globalWrapperRef.current);
    const discAnimAngle = getRotationAngle(disc === 1 ? disc1WrapperRef.current : disc2WrapperRef.current);
    const discBaseRotation = disc === 1 ? disc1BaseRotation : disc2BaseRotation;

    const totalRotationDeg = masterAnimAngle + globalAnimAngle + discAnimAngle + discBaseRotation;
    const totalRotationRad = totalRotationDeg * Math.PI / 180;
    
    const relativeAngle = angleRad - totalRotationRad;

    onAddDot({
        disc,
        radius,
        angle: relativeAngle,
        color: brushColor,
        pathId: currentPathIdRef.current,
    });
  }, [isBrushMode, disc2Coverage, disc1BaseRotation, disc2BaseRotation, onAddDot, brushColor, maxRadius]);

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

  const renderPaths = (discNumber: 1 | 2) => {
    const paths = dots
      .filter(d => d.disc === discNumber)
      .reduce<Record<string, Dot[]>>((acc, dot) => {
        if (!acc[dot.pathId]) {
          acc[dot.pathId] = [];
        }
        acc[dot.pathId].push(dot);
        return acc;
      }, {});

    return Object.values(paths).map(pathDots => {
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

  const Disc1 = disc1OuterRadius > 0.1 ? ( // Only render if it has some area
    <div ref={disc1WrapperRef} className="absolute top-0 left-0 w-full h-full" style={disc1WheelStyle}>
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(${disc1BaseRotation} ${center} ${center})`}>
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
            />
          ))}
          {renderPaths(1)}
        </g>
      </svg>
    </div>
  ) : null;

  const Disc2 = disc2OuterRadius > disc2InnerRadius ? ( // Only render if it has some area
     <div ref={disc2WrapperRef} className="absolute w-full h-full" style={disc2WheelStyle}>
        <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
          <g transform={`rotate(${disc2BaseRotation} ${center} ${center})`}>
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
              />
            ))}
            {renderPaths(2)}
          </g>
        </svg>
      </div>
  ) : null;

  return (
      <div 
        className="relative w-[600px] h-[600px] drop-shadow-2xl"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isBrushMode ? 'crosshair' : 'default' }}
      >
        <div ref={masterWrapperRef} className="absolute w-full h-full" style={masterWheelStyle}>
          <div ref={globalWrapperRef} className="absolute w-full h-full" style={globalWheelStyle}>
            {Disc2}
            {Disc1}
          </div>
        </div>
      </div>
  );
};