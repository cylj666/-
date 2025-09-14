// Fix: Removed circular import of 'CurvatureMode' that conflicted with the local declaration.
export type CurvatureMode = 'standard' | 'golden' | 'inverse-golden';

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
  };
}
