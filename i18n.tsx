import React, { createContext, useState, useContext, ReactNode } from 'react';

// FIX: This file was empty. Implemented a complete i18n system to resolve module errors.
const translations = {
  en: {
    // App.tsx
    switchToChinese: '切换到中文',
    switchToEnglish: 'Switch to English',
    // visualizers/v2D/index.tsx
    interactiveColorWheel: 'Interactive Color Wheel',
    interactive: 'Interactive',
    colorWheel: 'Color Wheel',
    // visualizers/v1D/index.tsx
    radialSliceView: 'Radial Slice View',
    center: 'Center',
    edge: 'Edge',
    // visualizers/v2D/components/Controls.tsx
    interactionMode: 'Interaction Mode',
    panAndZoom: 'Pan & Zoom',
    scanner: 'Scanner',
    colorNameRed: '赤',
    colorNameOrange: '橙',
    colorNameYellow: '黄',
    colorNameGreen: '绿',
    colorNameCyan: '青',
    colorNameBlue: '蓝',
    colorNameViolet: '紫',
    innerDiscCurvature: 'Inner Disc Curvature',
    curvatureValue: 'Curvature Value',
    straight: 'Straight',
    inverseGoldenRatio: 'Inverse Golden Ratio',
    goldenRatio: 'Golden Ratio',
    goldenSpiral: 'Golden Spiral',
    spiky: 'Spiky',
    outerDiscCurvature: 'Outer Disc Curvature',
    innerDiscRotation: 'Inner Disc Rotation',
    clockwise: 'Clockwise',
    counterClockwise: 'Counter-Clockwise',
    pause: 'Pause',
    play: 'Play',
    rps: 'rev/s',
    outerDiscRotation: 'Outer Disc Rotation',
    outerDiscInfluenceDepth: 'Outer Disc Influence Depth',
    globalRotation: 'Global Rotation',
    colors: 'Colors',
    presets: 'Presets',
    enterPresetName: 'Enter preset name...',
    savePreset: 'Save Preset',
    hideAdvancedSettings: 'Hide Advanced Settings',
    showAdvancedSettings: 'Show Advanced Settings',
    partitions: 'Partitions',
    displayMode: 'Display Mode',
    exitFullscreen: 'Exit Fullscreen',
    fullscreen: 'Fullscreen',
    zoom: 'Zoom',
    canvasBackground: 'Canvas Background',
    black: 'Black',
    white: 'White',
    brush: 'Brush',
    clearAllDots: 'Clear All Dots',
    brushColor: 'Brush Color',
    rotationLock: 'Rotation Lock',
    unlockRotation: 'Unlock Rotation',
    lockRotation: 'Lock Rotation',
    baseAngle: 'Base Angle',
    innerDiscBaseAngle: 'Inner Disc Base Angle',
    degrees: 'deg',
    outerDiscBaseAngle: 'Outer Disc Base Angle',
    hideAdvancedSettings2: 'Hide Waveform & Phase Settings',
    showAdvancedSettings2: 'Show Waveform & Phase Settings',
    innerDiscWaveform: 'Inner Disc Waveform',
    spiral: 'Spiral',
    sineWave: 'Sine Wave',
    opacity: 'Opacity',
    waveAmplitude: 'Wave Amplitude',
    waveFrequency: 'Wave Frequency',
    outerDiscWaveform: 'Outer Disc Waveform',
    breathingModel: 'Breathing Model',
    breathingDepth: 'Breathing Depth',
    breathingSpeed: 'Breathing Speed',
  },
  zh: {
    // App.tsx
    switchToChinese: '切换到中文',
    switchToEnglish: '切换到英文',
    // visualizers/v2D/index.tsx
    interactiveColorWheel: '交互式色轮',
    interactive: '交互式',
    colorWheel: '色轮',
    // visualizers/v1D/index.tsx
    radialSliceView: '径向切片视图',
    center: '中心',
    edge: '边缘',
    // visualizers/v2D/components/Controls.tsx
    interactionMode: '交互模式',
    panAndZoom: '平移缩放',
    scanner: '扫描仪',
    colorNameRed: '赤',
    colorNameOrange: '橙',
    colorNameYellow: '黄',
    colorNameGreen: '绿',
    colorNameCyan: '青',
    colorNameBlue: '蓝',
    colorNameViolet: '紫',
    innerDiscCurvature: '内盘曲率',
    curvatureValue: '曲率值',
    straight: '直线',
    inverseGoldenRatio: '反黄金比例',
    goldenRatio: '黄金比例',
    goldenSpiral: '黄金螺旋',
    spiky: '尖状',
    outerDiscCurvature: '外盘曲率',
    innerDiscRotation: '内盘旋转',
    clockwise: '顺时针',
    counterClockwise: '逆时针',
    pause: '暂停',
    play: '播放',
    rps: '转/秒',
    outerDiscRotation: '外盘旋转',
    outerDiscInfluenceDepth: '外盘由外到内的影响深度',
    globalRotation: '全局旋转',
    colors: '颜色',
    presets: '预设',
    enterPresetName: '输入预设名称...',
    savePreset: '保存预设',
    hideAdvancedSettings: '隐藏高级设置',
    showAdvancedSettings: '显示高级设置',
    partitions: '分区',
    displayMode: '显示模式',
    exitFullscreen: '退出全屏',
    fullscreen: '全屏',
    zoom: '缩放',
    canvasBackground: '画布背景',
    black: '黑色',
    white: '白色',
    brush: '画笔',
    clearAllDots: '清除所有点',
    brushColor: '画笔颜色',
    rotationLock: '旋转锁定',
    unlockRotation: '解锁旋转',
    lockRotation: '锁定旋转',
    baseAngle: '基础角度',
    innerDiscBaseAngle: '内盘基础角度',
    degrees: '度',
    outerDiscBaseAngle: '外盘基础角度',
    hideAdvancedSettings2: '隐藏波形与相位设置',
    showAdvancedSettings2: '显示波形与相位设置',
    innerDiscWaveform: '内盘波形',
    spiral: '螺旋',
    sineWave: '正弦波',
    opacity: '不透明度',
    waveAmplitude: '波幅',
    waveFrequency: '波频',
    outerDiscWaveform: '外盘波形',
    breathingModel: '呼吸模型',
    breathingDepth: '呼吸深度',
    breathingSpeed: '呼吸速度',
  },
};

type Language = 'en' | 'zh';
type TranslationKeys = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  const t = (key: TranslationKeys): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};