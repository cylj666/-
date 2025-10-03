import React from 'react';
import { ColorWheel } from './components/ColorWheel';
import { useSettings } from '../../contexts/SettingsContext';

const Visualizer2D: React.FC = () => {
  const settings = useSettings();

  return (
    <ColorWheel
      segments={settings.segments}
      colors={settings.colors}
      disc1Curvature={settings.calculatedDisc1Curvature}
      disc1Waveform={settings.disc1Waveform}
      disc1Opacity={settings.disc1Opacity}
      disc1SineAmplitude={settings.disc1SineAmplitude}
      disc1SineFrequency={settings.disc1SineFrequency}
      disc1PhaseRange={settings.disc1PhaseRange}
      disc1PhaseSpeed={settings.disc1PhaseSpeed}
      disc2Curvature={settings.calculatedDisc2Curvature}
      disc2Waveform={settings.disc2Waveform}
      disc2Opacity={settings.disc2Opacity}
      disc2SineAmplitude={settings.disc2SineAmplitude}
      disc2SineFrequency={settings.disc2SineFrequency}
      disc2PhaseRange={settings.disc2PhaseRange}
      disc2PhaseSpeed={settings.disc2PhaseSpeed}
      disc1RotationSpeed={settings.disc1RotationSpeed}
      disc1RotationDirection={settings.disc1RotationDirection}
      disc1BaseRotation={settings.disc1BaseRotation}
      disc2RotationSpeed={settings.disc2RotationSpeed}
      disc2RotationDirection={settings.disc2RotationDirection}
      disc2BaseRotation={settings.disc2BaseRotation}
      disc2Coverage={settings.disc2Coverage}
      globalRotationSpeed={settings.globalRotationSpeed}
      globalRotationDirection={settings.globalRotationDirection}
      dots={settings.dots}
      interactionMode={settings.interactionMode}
      onAddDot={settings.handleAddDot}
      animationAngles={settings.animationAngles}
      zoom={settings.zoom}
      setZoom={settings.setZoom}
      panOffset={settings.panOffset}
      setPanOffset={settings.setPanOffset}
      brushColor={settings.brushColor}
      scannerAngle={settings.scannerAngle}
      setScannerAngle={settings.setScannerAngle}
    />
  );
};

export default Visualizer2D;