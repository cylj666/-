import { Dot } from './types';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Controls } from './components/Controls';
import { ColorWheel } from './components/ColorWheel';
import type { CurvatureMode, Preset } from './types';
import { COLOR_PALETTE, PARTITION_OPTIONS, GOLDEN_SPIRAL_FACTOR, MAX_SPIRAL_FACTOR } from './constants';

const App: React.FC = () => {
  const [segments, setSegments] = useState<number>(PARTITION_OPTIONS[2]); // Default to 7
  const [colors, setColors] = useState<string[]>([]);
  
  // Disc 1 (formerly inner wheel) state
  const [disc1Mode, setDisc1Mode] = useState<CurvatureMode>('golden');
  const [disc1CustomCurvature, setDisc1CustomCurvature] = useState<number>(100); // Slider 0-200, center at 100
  const [disc1RotationSpeed, setDisc1RotationSpeed] = useState<number>(0); // revs per second
  const [disc1RotationDirection, setDisc1RotationDirection] = useState<'clockwise' | 'counter-clockwise'>('clockwise');
  const [lastNonZeroSpeed1, setLastNonZeroSpeed1] = useState<number>(1); // Default non-zero speed
  
  // Disc 2 (formerly outer wheel) state
  const [disc2Mode, setDisc2Mode] = useState<CurvatureMode>('standard');
  const [disc2CustomCurvature, setDisc2CustomCurvature] = useState<number>(100);
  const [disc2RotationSpeed, setDisc2RotationSpeed] = useState<number>(0);
  const [disc2RotationDirection, setDisc2RotationDirection] = useState<'clockwise' | 'counter-clockwise'>('clockwise');
  const [lastNonZeroSpeed2, setLastNonZeroSpeed2] = useState<number>(1);
  const [disc2Coverage, setDisc2Coverage] = useState<number>(30); // 0-100%
  
  // Shared state
  const [disc1BaseRotation, setDisc1BaseRotation] = useState<number>(0);
  const [disc2BaseRotation, setDisc2BaseRotation] = useState<number>(0);
  const [isRotationLocked, setIsRotationLocked] = useState<boolean>(false);

  // Global Rotation
  const [globalRotationSpeed, setGlobalRotationSpeed] = useState<number>(0);
  const [globalRotationDirection, setGlobalRotationDirection] = useState<'clockwise' | 'counter-clockwise'>('clockwise');
  const [lastNonZeroGlobalSpeed, setLastNonZeroGlobalSpeed] = useState<number>(1);

  // Master Rotation
  const [masterRotationSpeed, setMasterRotationSpeed] = useState<number>(0);
  const [masterRotationDirection, setMasterRotationDirection] = useState<'clockwise' | 'counter-clockwise'>('clockwise');
  const [lastNonZeroMasterSpeed, setLastNonZeroMasterSpeed] = useState<number>(1);

  // Brush state
  const [dots, setDots] = useState<Dot[]>([]);
  const [isBrushMode, setIsBrushMode] = useState<boolean>(false);
  const [brushColor, setBrushColor] = useState<string>('#FFFFFF');

  const [presets, setPresets] = useState<Preset[]>([]);

  // Display state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState<'black' | 'white'>('black');
  const mainRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    if (disc1RotationSpeed > 0) {
      setLastNonZeroSpeed1(disc1RotationSpeed);
    }
  }, [disc1RotationSpeed]);

  useEffect(() => {
    if (disc2RotationSpeed > 0) {
      setLastNonZeroSpeed2(disc2RotationSpeed);
    }
  }, [disc2RotationSpeed]);
  
  useEffect(() => {
    if (globalRotationSpeed > 0) {
      setLastNonZeroGlobalSpeed(globalRotationSpeed);
    }
  }, [globalRotationSpeed]);
  
  useEffect(() => {
    if (masterRotationSpeed > 0) {
      setLastNonZeroMasterSpeed(masterRotationSpeed);
    }
  }, [masterRotationSpeed]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);


  const handleSetColors = useCallback((newColors: string[]) => {
    setColors(newColors);
  }, []);
  
  const handleSetDisc1Mode = useCallback((m: CurvatureMode) => {
    setDisc1Mode(m);
    if (m === 'golden' || m === 'inverse-golden') {
      setDisc1CustomCurvature(100); 
    }
    setDisc1BaseRotation(0);
    setDisc2BaseRotation(0);
  }, []);

  const handleSetDisc2Mode = useCallback((m: CurvatureMode) => {
    setDisc2Mode(m);
    if (m === 'golden' || m === 'inverse-golden') {
      setDisc2CustomCurvature(100);
    }
    setDisc1BaseRotation(0);
    setDisc2BaseRotation(0);
  }, []);

  const handleTogglePlayPause1 = useCallback(() => {
    if (disc1RotationSpeed > 0) {
      setDisc1RotationSpeed(0);
    } else {
      setDisc1RotationSpeed(lastNonZeroSpeed1);
    }
  }, [disc1RotationSpeed, lastNonZeroSpeed1]);

  const handleTogglePlayPause2 = useCallback(() => {
    if (disc2RotationSpeed > 0) {
      setDisc2RotationSpeed(0);
    } else {
      setDisc2RotationSpeed(lastNonZeroSpeed2);
    }
  }, [disc2RotationSpeed, lastNonZeroSpeed2]);

  const handleTogglePlayPauseGlobal = useCallback(() => {
    if (globalRotationSpeed > 0) {
      setGlobalRotationSpeed(0);
    } else {
      setGlobalRotationSpeed(lastNonZeroGlobalSpeed);
    }
  }, [globalRotationSpeed, lastNonZeroGlobalSpeed]);
  
  const handleTogglePlayPauseMaster = useCallback(() => {
    if (masterRotationSpeed > 0) {
      setMasterRotationSpeed(0);
    } else {
      setMasterRotationSpeed(lastNonZeroMasterSpeed);
    }
  }, [masterRotationSpeed, lastNonZeroMasterSpeed]);

  const handleSetDisc1BaseRotation = useCallback((value: number) => {
    setDisc1BaseRotation(value);
    if (isRotationLocked) {
      setDisc2BaseRotation(value);
    }
  }, [isRotationLocked]);

  const handleSetDisc2BaseRotation = useCallback((value: number) => {
    setDisc2BaseRotation(value);
    if (isRotationLocked) {
      setDisc1BaseRotation(value);
    }
  }, [isRotationLocked]);
  
  const handleToggleFullscreen = useCallback(() => {
    if (!mainRef.current) return;

    if (!isFullscreen) {
      mainRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  const handleAddDot = useCallback((newDot: Omit<Dot, 'id'>) => {
    setDots(prev => [...prev, { ...newDot, id: Date.now().toString() + Math.random() }]);
  }, []);

  const handleClearDots = useCallback(() => {
    setDots([]);
  }, []);

  const handleSavePreset = useCallback((name: string) => {
    if (!name.trim()) return;
    const newPreset: Preset = {
      id: Date.now().toString(),
      name: name.trim(),
      settings: {
        segments,
        colors,
        disc1Mode,
        disc1CustomCurvature,
        disc2Mode,
        disc2CustomCurvature,
        disc1RotationSpeed,
        disc1RotationDirection,
        disc2RotationSpeed,
        disc2RotationDirection,
        disc1BaseRotation,
        disc2BaseRotation,
        isRotationLocked,
        disc2Coverage,
        dots,
        zoom,
        brushColor,
        globalRotationSpeed,
        globalRotationDirection,
        masterRotationSpeed,
        masterRotationDirection,
        panOffset,
        canvasBackgroundColor,
      },
    };
    setPresets(prev => [...prev, newPreset]);
  }, [segments, colors, disc1Mode, disc1CustomCurvature, disc2Mode, disc2CustomCurvature, disc1RotationSpeed, disc1RotationDirection, disc2RotationSpeed, disc2RotationDirection, disc1BaseRotation, disc2BaseRotation, isRotationLocked, disc2Coverage, dots, zoom, brushColor, globalRotationSpeed, globalRotationDirection, masterRotationSpeed, masterRotationDirection, panOffset, canvasBackgroundColor]);

  const handleApplyPreset = useCallback((id: string) => {
    const preset = presets.find(p => p.id === id);
    if (preset) {
      const { settings } = preset as any; // Use any to handle legacy presets
      setSegments(settings.segments);
      setColors(settings.colors);
      
      let disc1ModeValue = settings.disc1Mode ?? settings.innerMode;
      if (disc1ModeValue === 'custom') {
          disc1ModeValue = 'golden';
      }
      setDisc1Mode(disc1ModeValue);
      setDisc1CustomCurvature(settings.disc1CustomCurvature ?? settings.innerCustomCurvature);
      
      let disc2ModeValue = settings.disc2Mode ?? settings.outerMode ?? 'standard';
      if (disc2ModeValue === 'custom') {
          disc2ModeValue = 'golden';
      }
      setDisc2Mode(disc2ModeValue);
      setDisc2CustomCurvature(settings.disc2CustomCurvature ?? settings.outerCustomCurvature ?? 100);
      
      setDisc1RotationSpeed(settings.disc1RotationSpeed ?? settings.rotationSpeed);
      setDisc1RotationDirection(settings.disc1RotationDirection ?? settings.rotationDirection);
      setDisc2RotationSpeed(settings.disc2RotationSpeed ?? settings.rotationSpeed2);
      setDisc2RotationDirection(settings.disc2RotationDirection ?? settings.rotationDirection2);
      
      const baseRotation = settings.baseRotation ?? 0;
      setDisc1BaseRotation(settings.disc1BaseRotation ?? settings.innerBaseRotation ?? baseRotation);
      setDisc2BaseRotation(settings.disc2BaseRotation ?? settings.outerBaseRotation ?? baseRotation);
      
      setIsRotationLocked(settings.isRotationLocked ?? false);
      setDisc2Coverage(settings.disc2Coverage ?? 0);
      setDots(settings.dots ?? []);
      setZoom(settings.zoom ?? 1);
      setBrushColor(settings.brushColor ?? '#FFFFFF');
      setPanOffset(settings.panOffset ?? { x: 0, y: 0 });
      setCanvasBackgroundColor(settings.canvasBackgroundColor ?? 'black');

      setGlobalRotationSpeed(settings.globalRotationSpeed ?? 0);
      setGlobalRotationDirection(settings.globalRotationDirection ?? 'clockwise');
      setMasterRotationSpeed(settings.masterRotationSpeed ?? 0);
      setMasterRotationDirection(settings.masterRotationDirection ?? 'clockwise');
      
      if ((settings.disc1RotationSpeed ?? settings.rotationSpeed) > 0) {
        setLastNonZeroSpeed1(settings.disc1RotationSpeed ?? settings.rotationSpeed);
      }
      if ((settings.disc2RotationSpeed ?? settings.rotationSpeed2) > 0) {
        setLastNonZeroSpeed2(settings.disc2RotationSpeed ?? settings.rotationSpeed2);
      }
      if (settings.globalRotationSpeed > 0) {
        setLastNonZeroGlobalSpeed(settings.globalRotationSpeed);
      }
      if (settings.masterRotationSpeed > 0) {
        setLastNonZeroMasterSpeed(settings.masterRotationSpeed);
      }
    }
  }, [presets]);

  const handleDeletePreset = useCallback((id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
  }, []);


  const getCurvatureFactor = useCallback((mode: CurvatureMode, customCurvature: number) => {
    const calculateCustomFactor = (curvatureValue: number): number => {
        // This logic interpolates between spiky (MAX_SPIRAL_FACTOR) at value 0,
        // golden (GOLDEN_SPIRAL_FACTOR) at value 100,
        // and straight (0) at value 200.
        if (curvatureValue >= 100) {
            const fraction = (curvatureValue - 100) / 100; // 0 at 100, 1 at 200
            return GOLDEN_SPIRAL_FACTOR * (1 - fraction); // Interpolates from GOLDEN to 0
        } else {
            const fraction = curvatureValue / 100; // 0 at 0, 1 at 100
            return MAX_SPIRAL_FACTOR * (1 - fraction) + GOLDEN_SPIRAL_FACTOR * fraction; // Interpolates from MAX to GOLDEN
        }
    };

    switch (mode) {
      case 'standard':
        return 0;
      case 'golden':
        return calculateCustomFactor(customCurvature);
      case 'inverse-golden':
        return -calculateCustomFactor(customCurvature);
      default:
        return 0;
    }
  }, []);
  
  const disc1CurvatureFactor = getCurvatureFactor(disc1Mode, disc1CustomCurvature);
  const disc2CurvatureFactor = getCurvatureFactor(disc2Mode, disc2CustomCurvature);

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row items-stretch transition-colors duration-300 overflow-hidden">
      <header className="w-full lg:hidden p-4 bg-slate-800 border-b border-slate-700 shadow-md">
        <h1 className="text-2xl font-bold text-slate-100 text-center">交互式色轮</h1>
      </header>

      <aside className="w-full lg:w-96 bg-slate-800 p-6 shadow-lg lg:shadow-2xl flex-shrink-0 overflow-y-auto">
        <div className="sticky top-6">
          <div className="mb-8 hidden lg:block">
            <h1 className="text-3xl font-bold text-slate-100">交互式</h1>
            <h2 className="text-3xl font-bold text-indigo-400">色轮</h2>
            <p className="text-sm text-slate-400 mt-2">实时自定义分区、颜色和曲率。</p>
          </div>
          <Controls
            segments={segments}
            setSegments={setSegments}
            colors={colors}
            setColors={handleSetColors}
            
            disc1Mode={disc1Mode}
            setDisc1Mode={handleSetDisc1Mode}
            disc1CustomCurvature={disc1CustomCurvature}
            setDisc1CustomCurvature={setDisc1CustomCurvature}
            calculatedDisc1Curvature={disc1CurvatureFactor}
            
            disc2Mode={disc2Mode}
            setDisc2Mode={handleSetDisc2Mode}
            disc2CustomCurvature={disc2CustomCurvature}
            setDisc2CustomCurvature={setDisc2CustomCurvature}
            calculatedDisc2Curvature={disc2CurvatureFactor}
            
            disc1RotationSpeed={disc1RotationSpeed}
            setDisc1RotationSpeed={setDisc1RotationSpeed}
            disc1RotationDirection={disc1RotationDirection}
            setDisc1RotationDirection={setDisc1RotationDirection}
            onTogglePlayPause1={handleTogglePlayPause1}
            
            disc2RotationSpeed={disc2RotationSpeed}
            setDisc2RotationSpeed={setDisc2RotationSpeed}
            disc2RotationDirection={disc2RotationDirection}
            setDisc2RotationDirection={setDisc2RotationDirection}
            onTogglePlayPause2={handleTogglePlayPause2}
            
            disc1BaseRotation={disc1BaseRotation}
            setDisc1BaseRotation={handleSetDisc1BaseRotation}
            disc2BaseRotation={disc2BaseRotation}
            setDisc2BaseRotation={handleSetDisc2BaseRotation}
            isRotationLocked={isRotationLocked}
            setIsRotationLocked={setIsRotationLocked}
            
            disc2Coverage={disc2Coverage}
            setDisc2Coverage={setDisc2Coverage}

            globalRotationSpeed={globalRotationSpeed}
            setGlobalRotationSpeed={setGlobalRotationSpeed}
            globalRotationDirection={globalRotationDirection}
            setGlobalRotationDirection={setGlobalRotationDirection}
            onTogglePlayPauseGlobal={handleTogglePlayPauseGlobal}

            masterRotationSpeed={masterRotationSpeed}
            setMasterRotationSpeed={setMasterRotationSpeed}
            masterRotationDirection={masterRotationDirection}
            setMasterRotationDirection={setMasterRotationDirection}
            onTogglePlayPauseMaster={handleTogglePlayPauseMaster}

            presets={presets}
            onSavePreset={handleSavePreset}
            onApplyPreset={handleApplyPreset}
            onDeletePreset={handleDeletePreset}

            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            zoom={zoom}
            setZoom={setZoom}

            isBrushMode={isBrushMode}
            setIsBrushMode={setIsBrushMode}
            onClearDots={handleClearDots}
            brushColor={brushColor}
            setBrushColor={setBrushColor}
            canvasBackgroundColor={canvasBackgroundColor}
            setCanvasBackgroundColor={setCanvasBackgroundColor}
          />
        </div>
      </aside>

      <main ref={mainRef} className={`flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 transition-colors duration-300 ${canvasBackgroundColor === 'black' ? 'bg-black' : 'bg-white'}`}>
        <ColorWheel
          segments={segments}
          colors={colors}
          disc1Curvature={disc1CurvatureFactor}
          disc2Curvature={disc2CurvatureFactor}
          disc1RotationSpeed={disc1RotationSpeed}
          disc1RotationDirection={disc1RotationDirection}
          disc1BaseRotation={disc1BaseRotation}
          disc2RotationSpeed={disc2RotationSpeed}
          disc2RotationDirection={disc2RotationDirection}
          disc2BaseRotation={disc2BaseRotation}
          disc2Coverage={disc2Coverage}
          globalRotationSpeed={globalRotationSpeed}
          globalRotationDirection={globalRotationDirection}
          masterRotationSpeed={masterRotationSpeed}
          masterRotationDirection={masterRotationDirection}
          dots={dots}
          isBrushMode={isBrushMode}
          onAddDot={handleAddDot}
          zoom={zoom}
          panOffset={panOffset}
          setPanOffset={setPanOffset}
          brushColor={brushColor}
        />
      </main>
    </div>
  );
};

export default App;
