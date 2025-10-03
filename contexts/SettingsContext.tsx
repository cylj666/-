import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode, useRef } from 'react';
import { Dot, Preset, Waveform, CurvatureMode, InteractionMode } from '../types';
import { COLOR_PALETTE, PARTITION_OPTIONS, GOLDEN_SPIRAL_FACTOR, MAX_SPIRAL_FACTOR } from '../visualizers/v2D/constants';

// Define the shape of the context value
interface SettingsContextType {
  segments: number;
  setSegments: (s: number) => void;
  colors: string[];
  setColors: (c: string[]) => void;
  disc1Mode: CurvatureMode;
  setDisc1Mode: (m: CurvatureMode) => void;
  disc1CustomCurvature: number;
  setDisc1CustomCurvature: (c: number) => void;
  calculatedDisc1Curvature: number;
  disc1Waveform: Waveform;
  setDisc1Waveform: (w: Waveform) => void;
  disc1Opacity: number;
  setDisc1Opacity: (o: number) => void;
  disc1SineAmplitude: number;
  setDisc1SineAmplitude: (a: number) => void;
  disc1SineFrequency: number;
  setDisc1SineFrequency: (f: number) => void;
  disc1PhaseRange: number;
  setDisc1PhaseRange: (r: number) => void;
  disc1PhaseSpeed: number;
  setDisc1PhaseSpeed: (s: number) => void;
  disc2Mode: CurvatureMode;
  setDisc2Mode: (m: CurvatureMode) => void;
  disc2CustomCurvature: number;
  setDisc2CustomCurvature: (c: number) => void;
  calculatedDisc2Curvature: number;
  disc2Waveform: Waveform;
  setDisc2Waveform: (w: Waveform) => void;
  disc2Opacity: number;
  setDisc2Opacity: (o: number) => void;
  disc2SineAmplitude: number;
  setDisc2SineAmplitude: (a: number) => void;
  disc2SineFrequency: number;
  setDisc2SineFrequency: (f: number) => void;
  disc2PhaseRange: number;
  setDisc2PhaseRange: (r: number) => void;
  disc2PhaseSpeed: number;
  setDisc2PhaseSpeed: (s: number) => void;
  disc1RotationSpeed: number;
  setDisc1RotationSpeed: (s: number) => void;
  disc1RotationDirection: 'clockwise' | 'counter-clockwise';
  setDisc1RotationDirection: (d: 'clockwise' | 'counter-clockwise') => void;
  onTogglePlayPause1: () => void;
  disc2RotationSpeed: number;
  setDisc2RotationSpeed: (s: number) => void;
  disc2RotationDirection: 'clockwise' | 'counter-clockwise';
  setDisc2RotationDirection: (d: 'clockwise' | 'counter-clockwise') => void;
  onTogglePlayPause2: () => void;
  disc1BaseRotation: number;
  setDisc1BaseRotation: (d: number) => void;
  disc2BaseRotation: number;
  setDisc2BaseRotation: (d: number) => void;
  isRotationLocked: boolean;
  setIsRotationLocked: (l: boolean) => void;
  disc2Coverage: number;
  setDisc2Coverage: (c: number) => void;
  globalRotationSpeed: number;
  setGlobalRotationSpeed: (s: number) => void;
  globalRotationDirection: 'clockwise' | 'counter-clockwise';
  setGlobalRotationDirection: (d: 'clockwise' | 'counter-clockwise') => void;
  onTogglePlayPauseGlobal: () => void;
  presets: Preset[];
  onSavePreset: (name: string) => void;
  onApplyPreset: (id: string) => void;
  onDeletePreset: (id: string) => void;
  isFullscreen: boolean;
  zoom: number;
  setZoom: (z: number) => void;
  interactionMode: InteractionMode;
  setInteractionMode: (m: InteractionMode) => void;
  onClearDots: () => void;
  brushColor: string;
  setBrushColor: (c: string) => void;
  canvasBackgroundColor: 'black' | 'white';
  setCanvasBackgroundColor: (c: 'black' | 'white') => void;
  dots: Dot[];
  handleAddDot: (newDot: Omit<Dot, 'id'>) => void;
  panOffset: { x: number; y: number; };
  setPanOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number; }>>;
  animationAngles: { global: number; disc1: number; disc2: number; elapsedTime: number; };
  scannerAngle: number; // in degrees
  setScannerAngle: (a: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [segments, setSegments] = useState<number>(PARTITION_OPTIONS[2]); // Default to 7
  const [colors, setColors] = useState<string[]>([]);
  
  const [disc1Mode, setDisc1Mode] = useState<CurvatureMode>('golden');
  const [disc1CustomCurvature, setDisc1CustomCurvature] = useState<number>(100);
  const [disc1RotationSpeed, setDisc1RotationSpeed] = useState<number>(0);
  const [disc1RotationDirection, setDisc1RotationDirection] = useState<'clockwise' | 'counter-clockwise'>('clockwise');
  const [lastNonZeroSpeed1, setLastNonZeroSpeed1] = useState<number>(1);
  const [disc1Waveform, setDisc1Waveform] = useState<Waveform>('spiral');
  const [disc1Opacity, setDisc1Opacity] = useState<number>(100);
  const [disc1SineAmplitude, setDisc1SineAmplitude] = useState<number>(10);
  const [disc1SineFrequency, setDisc1SineFrequency] = useState<number>(5);
  const [disc1PhaseRange, setDisc1PhaseRange] = useState<number>(0);
  const [disc1PhaseSpeed, setDisc1PhaseSpeed] = useState<number>(1);

  const [disc2Mode, setDisc2Mode] = useState<CurvatureMode>('standard');
  const [disc2CustomCurvature, setDisc2CustomCurvature] = useState<number>(100);
  const [disc2RotationSpeed, setDisc2RotationSpeed] = useState<number>(0);
  const [disc2RotationDirection, setDisc2RotationDirection] = useState<'clockwise' | 'counter-clockwise'>('clockwise');
  const [lastNonZeroSpeed2, setLastNonZeroSpeed2] = useState<number>(1);
  const [disc2Coverage, setDisc2Coverage] = useState<number>(30);
  const [disc2Waveform, setDisc2Waveform] = useState<Waveform>('spiral');
  const [disc2Opacity, setDisc2Opacity] = useState<number>(100);
  const [disc2SineAmplitude, setDisc2SineAmplitude] = useState<number>(10);
  const [disc2SineFrequency, setDisc2SineFrequency] = useState<number>(5);
  const [disc2PhaseRange, setDisc2PhaseRange] = useState<number>(0);
  const [disc2PhaseSpeed, setDisc2PhaseSpeed] = useState<number>(1);
  
  const [disc1BaseRotation, setDisc1BaseRotation] = useState<number>(0);
  const [disc2BaseRotation, setDisc2BaseRotation] = useState<number>(0);
  const [isRotationLocked, setIsRotationLocked] = useState<boolean>(false);

  const [globalRotationSpeed, setGlobalRotationSpeed] = useState<number>(0);
  const [globalRotationDirection, setGlobalRotationDirection] = useState<'clockwise' | 'counter-clockwise'>('clockwise');
  const [lastNonZeroGlobalSpeed, setLastNonZeroGlobalSpeed] = useState<number>(1);

  const [dots, setDots] = useState<Dot[]>([]);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('pan');
  const [brushColor, setBrushColor] = useState<string>('#FFFFFF');

  const [presets, setPresets] = useState<Preset[]>([]);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState<'black' | 'white'>('black');
  
  const [animationAngles, setAnimationAngles] = useState({ global: 0, disc1: 0, disc2: 0, elapsedTime: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  const [scannerAngle, setScannerAngle] = useState<number>(0); // Angle in degrees

  useEffect(() => {
    try {
      const savedPresets = localStorage.getItem('colorWheelPresets');
      if (savedPresets) {
        setPresets(JSON.parse(savedPresets));
      }
    } catch (error) {
      console.error("Failed to load presets from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('colorWheelPresets', JSON.stringify(presets));
    } catch (error) {
        console.error("Failed to save presets to localStorage", error);
    }
  }, [presets]);

  useEffect(() => {
    setColors(COLOR_PALETTE.slice(0, segments));
  }, [segments]);

  useEffect(() => { if (disc1RotationSpeed > 0) setLastNonZeroSpeed1(disc1RotationSpeed); }, [disc1RotationSpeed]);
  useEffect(() => { if (disc2RotationSpeed > 0) setLastNonZeroSpeed2(disc2RotationSpeed); }, [disc2RotationSpeed]);
  useEffect(() => { if (globalRotationSpeed > 0) setLastNonZeroGlobalSpeed(globalRotationSpeed); }, [globalRotationSpeed]);
  
  const handleFullscreenChange = useCallback(() => {
    setIsFullscreen(document.fullscreenElement !== null);
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [handleFullscreenChange]);

  // Central Animation Loop
  useEffect(() => {
    startTimeRef.current = performance.now();
    
    const animate = (timestamp: number) => {
      const elapsedTime = (timestamp - startTimeRef.current) / 1000; // in seconds
      
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

      setAnimationAngles({
        global: globalAngle,
        disc1: disc1TotalAngle,
        disc2: disc2TotalAngle,
        elapsedTime: elapsedTime,
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [
    disc1RotationSpeed, disc1RotationDirection, disc1BaseRotation, disc1PhaseRange, disc1PhaseSpeed,
    disc2RotationSpeed, disc2RotationDirection, disc2BaseRotation, disc2PhaseRange, disc2PhaseSpeed,
    globalRotationSpeed, globalRotationDirection,
  ]);

  const handleSetDisc1Mode = useCallback((m: CurvatureMode) => {
    setDisc1Mode(m);
    if (m === 'golden' || m === 'inverse-golden') setDisc1CustomCurvature(100); 
    setDisc1BaseRotation(0);
    setDisc2BaseRotation(0);
  }, []);

  const handleSetDisc2Mode = useCallback((m: CurvatureMode) => {
    setDisc2Mode(m);
    if (m === 'golden' || m === 'inverse-golden') setDisc2CustomCurvature(100);
    setDisc1BaseRotation(0);
    setDisc2BaseRotation(0);
  }, []);

  const onTogglePlayPause1 = useCallback(() => setDisc1RotationSpeed(s => s > 0 ? 0 : lastNonZeroSpeed1), [lastNonZeroSpeed1]);
  const onTogglePlayPause2 = useCallback(() => setDisc2RotationSpeed(s => s > 0 ? 0 : lastNonZeroSpeed2), [lastNonZeroSpeed2]);
  const onTogglePlayPauseGlobal = useCallback(() => setGlobalRotationSpeed(s => s > 0 ? 0 : lastNonZeroGlobalSpeed), [lastNonZeroGlobalSpeed]);

  const handleSetDisc1BaseRotation = useCallback((value: number) => {
    setDisc1BaseRotation(value);
    if (isRotationLocked) setDisc2BaseRotation(value);
  }, [isRotationLocked]);

  const handleSetDisc2BaseRotation = useCallback((value: number) => {
    setDisc2BaseRotation(value);
    if (isRotationLocked) setDisc1BaseRotation(value);
  }, [isRotationLocked]);
  
  const handleAddDot = useCallback((newDot: Omit<Dot, 'id'>) => setDots(prev => [...prev, { ...newDot, id: Date.now().toString() + Math.random() }]), []);
  const onClearDots = useCallback(() => setDots([]), []);

  const onSavePreset = useCallback((name: string) => {
    if (!name.trim()) return;
    const newPreset: Preset = {
      id: Date.now().toString(),
      name: name.trim(),
      settings: { segments, colors, disc1Mode, disc1CustomCurvature, disc2Mode, disc2CustomCurvature, disc1RotationSpeed, disc1RotationDirection, disc2RotationSpeed, disc2RotationDirection, disc1BaseRotation, disc2BaseRotation, isRotationLocked, disc2Coverage, dots, zoom, brushColor, globalRotationSpeed, globalRotationDirection, panOffset, canvasBackgroundColor, disc1Waveform, disc1Opacity, disc1SineAmplitude, disc1SineFrequency, disc2Waveform, disc2Opacity, disc2SineAmplitude, disc2SineFrequency, disc1PhaseRange, disc1PhaseSpeed, disc2PhaseRange, disc2PhaseSpeed },
    };
    setPresets(prev => [...prev, newPreset]);
  }, [segments, colors, disc1Mode, disc1CustomCurvature, disc2Mode, disc2CustomCurvature, disc1RotationSpeed, disc1RotationDirection, disc2RotationSpeed, disc2RotationDirection, disc1BaseRotation, disc2BaseRotation, isRotationLocked, disc2Coverage, dots, zoom, brushColor, globalRotationSpeed, globalRotationDirection, panOffset, canvasBackgroundColor, disc1Waveform, disc1Opacity, disc1SineAmplitude, disc1SineFrequency, disc2Waveform, disc2Opacity, disc2SineAmplitude, disc2SineFrequency, disc1PhaseRange, disc1PhaseSpeed, disc2PhaseRange, disc2PhaseSpeed]);

  const onApplyPreset = useCallback((id: string) => {
    const preset = presets.find(p => p.id === id);
    if (preset) {
      const { settings } = preset as any;
      setSegments(settings.segments);
      setColors(settings.colors);
      setDisc1Mode(settings.disc1Mode ?? 'golden');
      setDisc1CustomCurvature(settings.disc1CustomCurvature ?? 100);
      setDisc2Mode(settings.disc2Mode ?? 'standard');
      setDisc2CustomCurvature(settings.disc2CustomCurvature ?? 100);
      setDisc1RotationSpeed(settings.disc1RotationSpeed ?? 0);
      setDisc1RotationDirection(settings.disc1RotationDirection ?? 'clockwise');
      setDisc2RotationSpeed(settings.disc2RotationSpeed ?? 0);
      setDisc2RotationDirection(settings.disc2RotationDirection ?? 'clockwise');
      setDisc1BaseRotation(settings.disc1BaseRotation ?? 0);
      setDisc2BaseRotation(settings.disc2BaseRotation ?? 0);
      setIsRotationLocked(settings.isRotationLocked ?? false);
      setDisc2Coverage(settings.disc2Coverage ?? 30);
      setDots(settings.dots ?? []);
      setZoom(settings.zoom ?? 1);
      setBrushColor(settings.brushColor ?? '#FFFFFF');
      setPanOffset(settings.panOffset ?? { x: 0, y: 0 });
      setCanvasBackgroundColor(settings.canvasBackgroundColor ?? 'black');
      setGlobalRotationSpeed(settings.globalRotationSpeed ?? 0);
      setGlobalRotationDirection(settings.globalRotationDirection ?? 'clockwise');
      setDisc1Waveform(settings.disc1Waveform ?? 'spiral');
      setDisc2Waveform(settings.disc2Waveform ?? 'spiral');
      setDisc1Opacity(settings.disc1Opacity ?? 100);
      setDisc1SineAmplitude(settings.disc1SineAmplitude ?? 10);
      setDisc1SineFrequency(settings.disc1SineFrequency ?? 5);
      setDisc2Opacity(settings.disc2Opacity ?? 100);
      setDisc2SineAmplitude(settings.disc2SineAmplitude ?? 10);
      setDisc2SineFrequency(settings.disc2SineFrequency ?? 5);
      setDisc1PhaseRange(settings.disc1PhaseRange ?? 0);
      setDisc1PhaseSpeed(settings.disc1PhaseSpeed ?? 1);
      setDisc2PhaseRange(settings.disc2PhaseRange ?? 0);
      setDisc2PhaseSpeed(settings.disc2PhaseSpeed ?? 1);
      if (settings.disc1RotationSpeed > 0) setLastNonZeroSpeed1(settings.disc1RotationSpeed);
      if (settings.disc2RotationSpeed > 0) setLastNonZeroSpeed2(settings.disc2RotationSpeed);
      if (settings.globalRotationSpeed > 0) setLastNonZeroGlobalSpeed(settings.globalRotationSpeed);
    }
  }, [presets]);

  const onDeletePreset = useCallback((id: string) => setPresets(prev => prev.filter(p => p.id !== id)), []);

  const getCurvatureFactor = useCallback((mode: CurvatureMode, customCurvature: number) => {
    const calculateCustomFactor = (curvatureValue: number): number => {
        if (curvatureValue >= 100) {
            const fraction = (curvatureValue - 100) / 99.9; // Normalize 100-199.9 to 0-1
            // Interpolate from golden spiral to straight line
            return GOLDEN_SPIRAL_FACTOR * (1 - fraction);
        } else {
            const fraction = curvatureValue / 100; // Normalize 0-100 to 0-1
            // Interpolate from spiky to golden spiral
            return MAX_SPIRAL_FACTOR * (1 - fraction) + GOLDEN_SPIRAL_FACTOR * fraction;
        }
    };
    switch (mode) {
      case 'standard': return 0;
      case 'golden': return calculateCustomFactor(customCurvature);
      case 'inverse-golden': return -calculateCustomFactor(customCurvature);
      default: return 0;
    }
  }, []);
  
  const calculatedDisc1Curvature = getCurvatureFactor(disc1Mode, disc1CustomCurvature);
  const calculatedDisc2Curvature = getCurvatureFactor(disc2Mode, disc2CustomCurvature);

  const value: SettingsContextType = {
    segments, setSegments, colors, setColors, disc1Mode, setDisc1Mode: handleSetDisc1Mode, disc1CustomCurvature, setDisc1CustomCurvature, calculatedDisc1Curvature, disc1Waveform, setDisc1Waveform, disc1Opacity, setDisc1Opacity, disc1SineAmplitude, setDisc1SineAmplitude, disc1SineFrequency, setDisc1SineFrequency, disc1PhaseRange, setDisc1PhaseRange, disc1PhaseSpeed, setDisc1PhaseSpeed, disc2Mode, setDisc2Mode: handleSetDisc2Mode, disc2CustomCurvature, setDisc2CustomCurvature, calculatedDisc2Curvature, disc2Waveform, setDisc2Waveform, disc2Opacity, setDisc2Opacity, disc2SineAmplitude, setDisc2SineAmplitude, disc2SineFrequency, setDisc2SineFrequency, disc2PhaseRange, setDisc2PhaseRange, disc2PhaseSpeed, setDisc2PhaseSpeed, disc1RotationSpeed, setDisc1RotationSpeed, disc1RotationDirection, setDisc1RotationDirection, onTogglePlayPause1, disc2RotationSpeed, setDisc2RotationSpeed, disc2RotationDirection, setDisc2RotationDirection, onTogglePlayPause2, disc1BaseRotation, setDisc1BaseRotation: handleSetDisc1BaseRotation, disc2BaseRotation, setDisc2BaseRotation: handleSetDisc2BaseRotation, isRotationLocked, setIsRotationLocked, disc2Coverage, setDisc2Coverage, globalRotationSpeed, setGlobalRotationSpeed, globalRotationDirection, setGlobalRotationDirection, onTogglePlayPauseGlobal, presets, onSavePreset, onApplyPreset, onDeletePreset, isFullscreen, zoom, setZoom, interactionMode, setInteractionMode, onClearDots, brushColor, setBrushColor, canvasBackgroundColor, setCanvasBackgroundColor, dots, handleAddDot, panOffset, setPanOffset, animationAngles, scannerAngle, setScannerAngle
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};