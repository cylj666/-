import React, { useState, useEffect } from 'react';
import type { CurvatureMode, Preset } from '../types';
import { PARTITION_OPTIONS, COLOR_PALETTE, GOLDEN_SPIRAL_FACTOR } from '../constants';

interface ControlsProps {
  segments: number;
  setSegments: (s: number) => void;
  colors: string[];
  setColors: (c: string[]) => void;
  
  disc1Mode: CurvatureMode;
  setDisc1Mode: (m: CurvatureMode) => void;
  disc1CustomCurvature: number;
  setDisc1CustomCurvature: (c: number) => void;
  calculatedDisc1Curvature: number;

  disc2Mode: CurvatureMode;
  setDisc2Mode: (m: CurvatureMode) => void;
  disc2CustomCurvature: number;
  setDisc2CustomCurvature: (c: number) => void;
  calculatedDisc2Curvature: number;

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
  
  masterRotationSpeed: number;
  setMasterRotationSpeed: (s: number) => void;
  masterRotationDirection: 'clockwise' | 'counter-clockwise';
  setMasterRotationDirection: (d: 'clockwise' | 'counter-clockwise') => void;
  onTogglePlayPauseMaster: () => void;

  presets: Preset[];
  onSavePreset: (name: string) => void;
  onApplyPreset: (id: string) => void;
  onDeletePreset: (id: string) => void;

  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  zoom: number;
  setZoom: (z: number) => void;
  
  isBrushMode: boolean;
  setIsBrushMode: (b: boolean) => void;
  onClearDots: () => void;
  brushColor: string;
  setBrushColor: (c: string) => void;
  canvasBackgroundColor: 'black' | 'white';
  setCanvasBackgroundColor: (c: 'black' | 'white') => void;
}

const ControlSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">{title}</h3>
    {children}
  </div>
);

const OptionButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  disabled?: boolean;
}> = ({ onClick, isActive, children, disabled }) => {
  const baseClasses = "px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-all duration-200 disabled:cursor-not-allowed";
  const activeClasses = "bg-indigo-600 text-white shadow";
  const inactiveClasses = "bg-slate-700 text-slate-200 hover:bg-slate-600";
  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`} disabled={disabled}>
      {children}
    </button>
  );
};

export const Controls: React.FC<ControlsProps> = (props) => {
  const {
    segments, setSegments, colors, setColors,
    disc1Mode, setDisc1Mode, disc1CustomCurvature, setDisc1CustomCurvature, calculatedDisc1Curvature,
    disc2Mode, setDisc2Mode, disc2CustomCurvature, setDisc2CustomCurvature, calculatedDisc2Curvature,
    disc1RotationSpeed, setDisc1RotationSpeed, disc1RotationDirection, setDisc1RotationDirection, onTogglePlayPause1,
    disc2RotationSpeed, setDisc2RotationSpeed, disc2RotationDirection, setDisc2RotationDirection, onTogglePlayPause2,
    disc1BaseRotation, setDisc1BaseRotation, disc2BaseRotation, setDisc2BaseRotation, isRotationLocked, setIsRotationLocked,
    disc2Coverage, setDisc2Coverage,
    globalRotationSpeed, setGlobalRotationSpeed, globalRotationDirection, setGlobalRotationDirection, onTogglePlayPauseGlobal,
    masterRotationSpeed, setMasterRotationSpeed, masterRotationDirection, setMasterRotationDirection, onTogglePlayPauseMaster,
    presets, onSavePreset, onApplyPreset, onDeletePreset, isFullscreen, onToggleFullscreen, zoom, setZoom,
    isBrushMode, setIsBrushMode, onClearDots, brushColor, setBrushColor, canvasBackgroundColor, setCanvasBackgroundColor,
  } = props;

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [speedInputText1, setSpeedInputText1] = useState<string>(String(disc1RotationSpeed));
  const [speedInputText2, setSpeedInputText2] = useState<string>(String(disc2RotationSpeed));
  const [globalSpeedInputText, setGlobalSpeedInputText] = useState<string>(String(globalRotationSpeed));
  const [masterSpeedInputText, setMasterSpeedInputText] = useState<string>(String(masterRotationSpeed));
  const [disc1CurvatureInputText, setDisc1CurvatureInputText] = useState<string>(String(disc1CustomCurvature));
  const [disc2CurvatureInputText, setDisc2CurvatureInputText] = useState<string>(String(disc2CustomCurvature));
  const [disc1BaseRotationText, setDisc1BaseRotationText] = useState<string>(String(disc1BaseRotation));
  const [disc2BaseRotationText, setDisc2BaseRotationText] = useState<string>(String(disc2BaseRotation));
  const [disc2CoverageText, setDisc2CoverageText] = useState<string>(String(disc2Coverage));
  const [zoomText, setZoomText] = useState<string>(String(zoom));
  const [presetName, setPresetName] = useState('');

  useEffect(() => { setSpeedInputText1(String(disc1RotationSpeed)); }, [disc1RotationSpeed]);
  useEffect(() => { setSpeedInputText2(String(disc2RotationSpeed)); }, [disc2RotationSpeed]);
  useEffect(() => { setGlobalSpeedInputText(String(globalRotationSpeed)); }, [globalRotationSpeed]);
  useEffect(() => { setMasterSpeedInputText(String(masterRotationSpeed)); }, [masterRotationSpeed]);
  useEffect(() => { setDisc1CurvatureInputText(String(disc1CustomCurvature)); }, [disc1CustomCurvature]);
  useEffect(() => { setDisc2CurvatureInputText(String(disc2CustomCurvature)); }, [disc2CustomCurvature]);
  useEffect(() => { setDisc1BaseRotationText(String(disc1BaseRotation)); }, [disc1BaseRotation]);
  useEffect(() => { setDisc2BaseRotationText(String(disc2BaseRotation)); }, [disc2BaseRotation]);
  useEffect(() => { setDisc2CoverageText(String(disc2Coverage)); }, [disc2Coverage]);
  useEffect(() => { setZoomText(String(zoom)); }, [zoom]);

  const handleColorChange = (index: number, newColor: string) => {
    const newColors = [...colors];
    newColors[index] = newColor;
    setColors(newColors);
  };

  const createNumericInputHandler = (setter: (s: number) => void, min: number, max: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') return;
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      setter(Math.max(min, Math.min(max, numericValue)));
    }
  };

  const createNumericInputBlurHandler = (currentValue: number, setter: (s: number) => void, textSetter: (t: string) => void, min: number, max: number) => () => {
    const numericValue = parseFloat(String(currentValue));
    let finalValue = currentValue;
    if (!isNaN(numericValue)) {
      finalValue = Math.max(min, Math.min(max, numericValue));
    }
    setter(finalValue);
    textSetter(String(finalValue));
  };
  
  const handleSavePresetClick = () => {
    onSavePreset(presetName);
    setPresetName(''); // Clear input after saving
  };

  const handleCurvatureSliderChange = (
    valueStr: string,
    setter: (c: number) => void
  ) => {
    const value = Number(valueStr);
    if (value >= 90 && value <= 110) {
      setter(100);
    } else {
      setter(value);
    }
  };

  // Rescale curvature for display so that golden ratio = 1.0
  const displayFactor = GOLDEN_SPIRAL_FACTOR > 0 ? 1 / GOLDEN_SPIRAL_FACTOR : 0;
  const displayedDisc1Curvature = (calculatedDisc1Curvature * displayFactor).toFixed(4);
  const displayedDisc2Curvature = (calculatedDisc2Curvature * displayFactor).toFixed(4);
  const colorNames = ['红', '橙', '黄', '绿', '青', '蓝', '紫'];

  return (
    <div className="space-y-8">

      <ControlSection title="内盘曲率">
        <div className="text-right text-xs text-slate-500 mb-2">
          <span className="font-mono bg-slate-700 px-2 py-1 rounded">曲率值: {displayedDisc1Curvature}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <OptionButton onClick={() => setDisc1Mode('standard')} isActive={disc1Mode === 'standard'}>直线</OptionButton>
          <OptionButton onClick={() => setDisc1Mode('inverse-golden')} isActive={disc1Mode === 'inverse-golden'}>反向黄金比例</OptionButton>
          <OptionButton onClick={() => setDisc1Mode('golden')} isActive={disc1Mode === 'golden'}>黄金比例</OptionButton>
        </div>
        {(disc1Mode === 'golden' || disc1Mode === 'inverse-golden') && (
          <div className="space-y-3 pt-2">
             <div className="flex flex-col">
                <div className="flex items-center space-x-4">
                    <input
                        type="range"
                        min="0"
                        max="199.9"
                        step="0.1"
                        value={disc1CustomCurvature}
                        onChange={(e) => handleCurvatureSliderChange(e.target.value, setDisc1CustomCurvature)}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                    <input
                        type="number"
                        min="0"
                        max="199.9"
                        step="0.1"
                        value={disc1CurvatureInputText}
                        onChange={(e) => { setDisc1CurvatureInputText(e.target.value); createNumericInputHandler(setDisc1CustomCurvature, 0, 199.9)(e);}}
                        onBlur={createNumericInputBlurHandler(disc1CustomCurvature, setDisc1CustomCurvature, setDisc1CurvatureInputText, 0, 199.9)}
                        className="w-20 p-1 text-center bg-slate-700 rounded-md"
                    />
                </div>
                <div className="relative -mt-1.5 w-[calc(100%-5.5rem)]">
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-0.5 h-1.5 bg-indigo-400" aria-hidden="true"></div>
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>直</span>
                        <span className="font-semibold text-indigo-400">黄金螺旋</span>
                        <span>弯</span>
                    </div>
                </div>
            </div>
          </div>
        )}
      </ControlSection>

      <ControlSection title="外盘曲率">
        <div className="text-right text-xs text-slate-500 mb-2">
          <span className="font-mono bg-slate-700 px-2 py-1 rounded">曲率值: {displayedDisc2Curvature}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <OptionButton onClick={() => setDisc2Mode('standard')} isActive={disc2Mode === 'standard'}>直线</OptionButton>
          <OptionButton onClick={() => setDisc2Mode('inverse-golden')} isActive={disc2Mode === 'inverse-golden'}>反向黄金比例</OptionButton>
          <OptionButton onClick={() => setDisc2Mode('golden')} isActive={disc2Mode === 'golden'}>黄金比例</OptionButton>
        </div>
        {(disc2Mode === 'golden' || disc2Mode === 'inverse-golden') && (
          <div className="space-y-3 pt-2">
            <div className="flex flex-col">
                <div className="flex items-center space-x-4">
                  <input
                      type="range"
                      min="0"
                      max="199.9"
                      step="0.1"
                      value={disc2CustomCurvature}
                      onChange={(e) => handleCurvatureSliderChange(e.target.value, setDisc2CustomCurvature)}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                  <input
                      type="number"
                      min="0"
                      max="199.9"
                      step="0.1"
                      value={disc2CurvatureInputText}
                      onChange={(e) => { setDisc2CurvatureInputText(e.target.value); createNumericInputHandler(setDisc2CustomCurvature, 0, 199.9)(e);}}
                      onBlur={createNumericInputBlurHandler(disc2CustomCurvature, setDisc2CustomCurvature, setDisc2CurvatureInputText, 0, 199.9)}
                      className="w-20 p-1 text-center bg-slate-700 rounded-md"
                  />
                </div>
                <div className="relative -mt-1.5 w-[calc(100%-5.5rem)]">
                    <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-0.5 h-1.5 bg-indigo-400" aria-hidden="true"></div>
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>直</span>
                        <span className="font-semibold text-indigo-400">黄金螺旋</span>
                        <span>弯</span>
                    </div>
                </div>
            </div>
          </div>
        )}
      </ControlSection>

      <ControlSection title="内旋转盘">
        <fieldset className="space-y-4">
            <div className="flex space-x-2">
                <OptionButton onClick={() => setDisc1RotationDirection('clockwise')} isActive={disc1RotationDirection === 'clockwise'}>顺时针</OptionButton>
                <OptionButton onClick={() => setDisc1RotationDirection('counter-clockwise')} isActive={disc1RotationDirection === 'counter-clockwise'}>逆时针</OptionButton>
                <OptionButton onClick={onTogglePlayPause1} isActive={false}>
                {disc1RotationSpeed > 0 ? '暂停' : '启动'}
                </OptionButton>
            </div>
            <div className="flex items-center space-x-4">
                <input
                type="range"
                min="0"
                max="121"
                step="0.01"
                value={disc1RotationSpeed}
                onChange={(e) => setDisc1RotationSpeed(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex items-baseline space-x-1">
                    <input
                        type="number"
                        min="0"
                        max="121"
                        step="0.01"
                        value={speedInputText1}
                        onChange={(e) => { setSpeedInputText1(e.target.value); createNumericInputHandler(setDisc1RotationSpeed, 0, 121)(e); }}
                        onBlur={createNumericInputBlurHandler(disc1RotationSpeed, setDisc1RotationSpeed, setSpeedInputText1, 0, 121)}
                        className="w-16 p-1 text-center bg-slate-700 rounded-md"
                    />
                    <span className="text-sm text-slate-400">圈/秒</span>
                </div>
            </div>
        </fieldset>
      </ControlSection>

      <ControlSection title="外旋转盘">
        <div className="space-y-4">
            <div className="flex space-x-2">
                <OptionButton onClick={() => setDisc2RotationDirection('clockwise')} isActive={disc2RotationDirection === 'clockwise'}>顺时针</OptionButton>
                <OptionButton onClick={() => setDisc2RotationDirection('counter-clockwise')} isActive={disc2RotationDirection === 'counter-clockwise'}>逆时针</OptionButton>
                <OptionButton onClick={onTogglePlayPause2} isActive={false}>
                {disc2RotationSpeed > 0 ? '暂停' : '启动'}
                </OptionButton>
            </div>
            <div className="flex items-center space-x-4">
                <input
                type="range"
                min="0"
                max="121"
                step="0.01"
                value={disc2RotationSpeed}
                onChange={(e) => setDisc2RotationSpeed(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex items-baseline space-x-1">
                    <input
                        type="number"
                        min="0"
                        max="121"
                        step="0.01"
                        value={speedInputText2}
                        onChange={(e) => { setSpeedInputText2(e.target.value); createNumericInputHandler(setDisc2RotationSpeed, 0, 121)(e);}}
                        onBlur={createNumericInputBlurHandler(disc2RotationSpeed, setDisc2RotationSpeed, setSpeedInputText2, 0, 121)}
                        className="w-16 p-1 text-center bg-slate-700 rounded-md"
                    />
                    <span className="text-sm text-slate-400">圈/秒</span>
                </div>
            </div>
             <div>
              <label className="text-xs text-slate-400">干涉深度</label>
              <div className="flex items-center space-x-4 mt-1">
                  <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.01"
                      value={disc2Coverage}
                      onChange={(e) => setDisc2Coverage(Number(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex items-baseline space-x-1">
                      <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={disc2CoverageText}
                          onChange={(e) => { setDisc2CoverageText(e.target.value); createNumericInputHandler(setDisc2Coverage, 0, 100)(e); }}
                          onBlur={createNumericInputBlurHandler(disc2Coverage, setDisc2Coverage, setDisc2CoverageText, 0, 100)}
                          className="w-16 p-1 text-center bg-slate-700 rounded-md"
                      />
                      <span className="text-sm text-slate-400">%</span>
                  </div>
              </div>
            </div>
        </div>
      </ControlSection>

      <ControlSection title="整体旋转">
        <fieldset className="space-y-4">
            <div className="flex space-x-2">
                <OptionButton onClick={() => setGlobalRotationDirection('clockwise')} isActive={globalRotationDirection === 'clockwise'}>顺时针</OptionButton>
                <OptionButton onClick={() => setGlobalRotationDirection('counter-clockwise')} isActive={globalRotationDirection === 'counter-clockwise'}>逆时针</OptionButton>
                <OptionButton onClick={onTogglePlayPauseGlobal} isActive={false}>
                {globalRotationSpeed > 0 ? '暂停' : '启动'}
                </OptionButton>
            </div>
            <div className="flex items-center space-x-4">
                <input
                type="range"
                min="0"
                max="121"
                step="0.01"
                value={globalRotationSpeed}
                onChange={(e) => setGlobalRotationSpeed(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex items-baseline space-x-1">
                    <input
                        type="number"
                        min="0"
                        max="121"
                        step="0.01"
                        value={globalSpeedInputText}
                        onChange={(e) => { setGlobalSpeedInputText(e.target.value); createNumericInputHandler(setGlobalRotationSpeed, 0, 121)(e); }}
                        onBlur={createNumericInputBlurHandler(globalRotationSpeed, setGlobalRotationSpeed, setGlobalSpeedInputText, 0, 121)}
                        className="w-16 p-1 text-center bg-slate-700 rounded-md"
                    />
                    <span className="text-sm text-slate-400">圈/秒</span>
                </div>
            </div>
        </fieldset>
      </ControlSection>

      <ControlSection title="框架旋转">
        <fieldset className="space-y-4">
            <div className="flex space-x-2">
                <OptionButton onClick={() => setMasterRotationDirection('clockwise')} isActive={masterRotationDirection === 'clockwise'}>顺时针</OptionButton>
                <OptionButton onClick={() => setMasterRotationDirection('counter-clockwise')} isActive={masterRotationDirection === 'counter-clockwise'}>逆时针</OptionButton>
                <OptionButton onClick={onTogglePlayPauseMaster} isActive={false}>
                {masterRotationSpeed > 0 ? '暂停' : '启动'}
                </OptionButton>
            </div>
            <div className="flex items-center space-x-4">
                <input
                type="range"
                min="0"
                max="121"
                step="0.01"
                value={masterRotationSpeed}
                onChange={(e) => setMasterRotationSpeed(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex items-baseline space-x-1">
                    <input
                        type="number"
                        min="0"
                        max="121"
                        step="0.01"
                        value={masterSpeedInputText}
                        onChange={(e) => { setMasterSpeedInputText(e.target.value); createNumericInputHandler(setMasterRotationSpeed, 0, 121)(e); }}
                        onBlur={createNumericInputBlurHandler(masterRotationSpeed, setMasterRotationSpeed, setMasterSpeedInputText, 0, 121)}
                        className="w-16 p-1 text-center bg-slate-700 rounded-md"
                    />
                    <span className="text-sm text-slate-400">圈/秒</span>
                </div>
            </div>
        </fieldset>
      </ControlSection>
      
      <ControlSection title="颜色">
        <div className="space-y-3">
          {colors.map((color, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-slate-600 flex items-center justify-center text-xl font-bold"
                style={{ color: color }}
              >
                {colorNames[index]}
              </div>
              <div className="flex-1 grid grid-cols-9 gap-1">
                {COLOR_PALETTE.map(paletteColor => (
                  <button
                    key={paletteColor}
                    onClick={() => handleColorChange(index, paletteColor)}
                    className={`w-6 h-6 rounded-full border border-slate-500 transition-transform duration-150 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 ${color === paletteColor ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-800' : ''}`}
                    style={{ backgroundColor: paletteColor }}
                    aria-label={`Set color ${paletteColor}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ControlSection>
      
      <ControlSection title="预设">
        <div className="flex space-x-2">
            <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="输入预设名称..."
                className="flex-1 p-2 bg-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
                onClick={handleSavePresetClick}
                className="px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-all duration-200 bg-indigo-600 text-white shadow hover:bg-indigo-700"
            >
                保存预设
            </button>
        </div>
        <div className="mt-4 space-y-2">
            {presets.map(preset => (
                <div key={preset.id} className="flex items-center justify-between bg-slate-700 p-2 rounded-md">
                    <button 
                      onClick={() => onApplyPreset(preset.id)}
                      className="text-sm font-medium text-slate-100 hover:text-indigo-400 flex-1 text-left"
                    >
                        {preset.name}
                    </button>
                    <button 
                      onClick={() => onDeletePreset(preset.id)}
                      className="text-slate-400 hover:text-red-400 text-xs font-bold px-2 py-1"
                      aria-label={`Delete preset ${preset.name}`}
                    >
                        X
                    </button>
                </div>
            ))}
        </div>
      </ControlSection>

      <ControlSection title="高级设置">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-all duration-200 bg-slate-700 text-slate-200 hover:bg-slate-600"
        >
          {showAdvanced ? '隐藏高级设置' : '显示高级设置'}
        </button>

        {showAdvanced && (
          <div className="mt-6 pt-6 border-t border-slate-700 space-y-8">
            <ControlSection title="分区">
              <div className="flex space-x-2">
                {PARTITION_OPTIONS.map(option => (
                  <OptionButton key={option} onClick={() => setSegments(option)} isActive={segments === option}>
                    {option}
                  </OptionButton>
                ))}
              </div>
            </ControlSection>

            <ControlSection title="显示模式">
              <div className="flex space-x-2 mb-4">
                  <OptionButton onClick={onToggleFullscreen} isActive={false}>
                      {isFullscreen ? '退出全屏' : '全屏观看'}
                  </OptionButton>
              </div>
              <div>
                <label className="text-xs text-slate-400">放大</label>
                <div className="flex items-center space-x-4 mt-1">
                    <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.1"
                        value={zoom}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex items-baseline space-x-1">
                        <input
                            type="number"
                            min="1"
                            max="10"
                            step="0.1"
                            value={zoomText}
                            onChange={(e) => { setZoomText(e.target.value); createNumericInputHandler(setZoom, 1, 10)(e); }}
                            onBlur={createNumericInputBlurHandler(zoom, setZoom, setZoomText, 1, 10)}
                            className="w-16 p-1 text-center bg-slate-700 rounded-md"
                        />
                        <span className="text-sm text-slate-400">x</span>
                    </div>
                </div>
              </div>
            </ControlSection>
            
            <ControlSection title="画布背景">
              <div className="flex space-x-2">
                <OptionButton onClick={() => setCanvasBackgroundColor('black')} isActive={canvasBackgroundColor === 'black'}>
                  黑色
                </OptionButton>
                <OptionButton onClick={() => setCanvasBackgroundColor('white')} isActive={canvasBackgroundColor === 'white'}>
                  白色
                </OptionButton>
              </div>
            </ControlSection>

            <ControlSection title="画笔">
              <div className="flex flex-col space-y-4">
                <div className="flex space-x-2">
                  <OptionButton onClick={() => setIsBrushMode(!isBrushMode)} isActive={isBrushMode}>
                    {isBrushMode ? '禁用画笔' : '启用画笔'}
                  </OptionButton>
                  <OptionButton onClick={onClearDots} isActive={false}>
                    清除所有点
                  </OptionButton>
                </div>
                {isBrushMode && (
                  <div className="flex items-center space-x-3 pt-2">
                    <label htmlFor="brush-color-picker" className="text-sm font-medium text-slate-300">
                      画笔颜色
                    </label>
                    <input
                      id="brush-color-picker"
                      type="color"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="w-10 h-10 p-1 bg-slate-700 border border-slate-600 rounded-md cursor-pointer"
                      title="选择画笔颜色"
                    />
                  </div>
                )}
              </div>
            </ControlSection>

            <ControlSection title="旋转联动">
              <div className="flex">
                  <OptionButton onClick={() => setIsRotationLocked(!isRotationLocked)} isActive={isRotationLocked}>
                      {isRotationLocked ? '解锁旋转' : '锁定旋转'}
                  </OptionButton>
              </div>
            </ControlSection>

            <ControlSection title="基础角度">
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400">内盘基础角度</label>
                  <div className="flex items-center space-x-4 mt-1">
                      <input
                          type="range"
                          min="0"
                          max="360"
                          step="1"
                          value={disc1BaseRotation}
                          onChange={(e) => setDisc1BaseRotation(Number(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex items-baseline space-x-1">
                          <input
                              type="number"
                              min="0"
                              max="360"
                              step="1"
                              value={disc1BaseRotationText}
                              onChange={(e) => { setDisc1BaseRotationText(e.target.value); createNumericInputHandler(setDisc1BaseRotation, 0, 360)(e); }}
                              onBlur={createNumericInputBlurHandler(disc1BaseRotation, setDisc1BaseRotation, setDisc1BaseRotationText, 0, 360)}
                              className="w-16 p-1 text-center bg-slate-700 rounded-md"
                          />
                          <span className="text-sm text-slate-400">度</span>
                      </div>
                  </div>
                </div>
                 <div>
                  <label className="text-xs text-slate-400">外盘基础角度</label>
                  <div className="flex items-center space-x-4 mt-1">
                      <input
                          type="range"
                          min="0"
                          max="360"
                          step="1"
                          value={disc2BaseRotation}
                          onChange={(e) => setDisc2BaseRotation(Number(e.target.value))}
                          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex items-baseline space-x-1">
                          <input
                              type="number"
                              min="0"
                              max="360"
                              step="1"
                              value={disc2BaseRotationText}
                              onChange={(e) => { setDisc2BaseRotationText(e.target.value); createNumericInputHandler(setDisc2BaseRotation, 0, 360)(e); }}
                              onBlur={createNumericInputBlurHandler(disc2BaseRotation, setDisc2BaseRotation, setDisc2BaseRotationText, 0, 360)}
                              className="w-16 p-1 text-center bg-slate-700 rounded-md"
                          />
                          <span className="text-sm text-slate-400">度</span>
                      </div>
                  </div>
                </div>
              </div>
            </ControlSection>

          </div>
        )}
      </ControlSection>
    </div>
  );
};