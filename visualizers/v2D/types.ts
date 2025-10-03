export type CurvatureMode = 'standard' | 'golden' | 'inverse-golden';

// A new type to define the fundamental shape of the partitions.
export type Waveform = 'spiral' | 'sine';

export type Dot = {
  id: string;
  pathId: string;
  disc: 1 | 2;
  radius: number;
  angle: number; // in radians
  color: string;
};

export interface Preset {
  id: string;
  name: string;
  settings: {
    segments: number;
    colors: string[];
    disc1Mode: CurvatureMode;
    disc1CustomCurvature: number;
    disc2Mode: CurvatureMode;
    disc2CustomCurvature: number;
    disc1RotationSpeed: number;
    disc1RotationDirection: 'clockwise' | 'counter-clockwise';
    disc2RotationSpeed: number;
    disc2RotationDirection: 'clockwise' | 'counter-clockwise';
    disc1BaseRotation: number;
    disc2BaseRotation: number;
    isRotationLocked: boolean;
    disc2Coverage: number;
    dots: Dot[];
    zoom: number;
    brushColor?: string;
    globalRotationSpeed?: number;
    globalRotationDirection?: 'clockwise' | 'counter-clockwise';
    masterRotationSpeed?: number;
    masterRotationDirection?: 'clockwise' | 'counter-clockwise';
    panOffset?: { x: number; y: number; };
    canvasBackgroundColor?: 'black' | 'white';
    // Waveform settings
    disc1Waveform?: Waveform;
    disc1Opacity?: number;
    disc1SineAmplitude?: number;
    disc1SineFrequency?: number;
    disc2Waveform?: Waveform;
    disc2Opacity?: number;
    disc2SineAmplitude?: number;
    disc2SineFrequency?: number;
    // Phase / Synchronization settings
    disc1PhaseRange?: number;
    disc1PhaseSpeed?: number;
    disc2PhaseRange?: number;
    disc2PhaseSpeed?: number;
  };
}
