import React, { useMemo } from 'react';
import { useSettings } from '../../../contexts/SettingsContext';
import { useTranslation } from '../../../i18n';
import type { Waveform } from '../../../types';

// Helper function to find the color at a specific point in the 2D visualizer
const getColorAtPoint = (
    radius: number,
    angleDegrees: number, // The global, un-rotated angle of the scanner
    settings: ReturnType<typeof useSettings>
): string => {
    const {
        segments,
        colors,
        disc1Waveform,
        calculatedDisc1Curvature,
        disc1SineAmplitude,
        disc1SineFrequency,
        disc2Waveform,
        calculatedDisc2Curvature,
        disc2SineAmplitude,
        disc2SineFrequency,
        disc2Coverage,
        animationAngles,
    } = settings;

    const size = 600;
    const maxRadius = size / 2 - 20;
    const boundaryRadius = maxRadius * (1 - disc2Coverage / 100);

    const disc = radius <= boundaryRadius ? 1 : 2;
    const totalRotationDeg = animationAngles.global + (disc === 1 ? animationAngles.disc1 : animationAngles.disc2);
    
    // The effective angle on the disc, accounting for its rotation
    let effectiveAngleRad = (angleDegrees - totalRotationDeg) * (Math.PI / 180);

    const waveform = disc === 1 ? disc1Waveform : disc2Waveform;
    const curvature = disc === 1 ? calculatedDisc1Curvature : calculatedDisc2Curvature;
    const sineAmp = disc === 1 ? disc1SineAmplitude : disc2SineAmplitude;
    const sineFreq = disc === 1 ? disc1SineFrequency : disc2SineFrequency;

    let baseAngleRad = effectiveAngleRad;

    // Reverse the waveform effect to find the original "straight" angle
    if (waveform === 'spiral' && Math.abs(curvature) > 1e-4) {
        const a = 1;
        const b = curvature;
        if (radius > a && maxRadius > a) {
            const t = Math.log(radius / a) / b;
            const tMaxSystem = Math.log(maxRadius / a) / b;
            const angleOffset = t - tMaxSystem;
            baseAngleRad -= angleOffset;
        }
    } else if (waveform === 'sine') {
        const ampRad = sineAmp * (Math.PI / 180);
        if (radius > 0 && maxRadius > 0) {
            const phase = (radius / maxRadius) * sineFreq * 2 * Math.PI;
            const angleOffset = ampRad * Math.sin(phase);
            baseAngleRad -= angleOffset;
        }
    }

    // Normalize angle to be positive
    baseAngleRad = (baseAngleRad + 100 * Math.PI) % (2 * Math.PI);
    
    // Determine segment index
    const angleOffset = -Math.PI / 2;
    let lookupAngle = (baseAngleRad - angleOffset + 2 * Math.PI) % (2 * Math.PI);

    const segmentIndex = Math.floor((lookupAngle / (2 * Math.PI)) * segments);
    return colors[segmentIndex] || '#000000';
};


export const RadialSlice: React.FC<ReturnType<typeof useSettings>> = (settings) => {
    const { scannerAngle } = settings;
    const { t } = useTranslation();
    const resolution = 500; // Number of rectangles to draw

    const size = { width: resolution, height: 50 };
    const maxR = 280; // from ColorWheelSVG maxRadius

    const colorStops = useMemo(() => {
        const stops = [];
        for (let i = 0; i < resolution; i++) {
            const radius = (i / (resolution - 1)) * maxR;
            const color = getColorAtPoint(radius, scannerAngle, settings);
            stops.push(
                <rect
                    key={i}
                    x={i}
                    y={0}
                    width={1}
                    height={size.height}
                    fill={color}
                />
            );
        }
        return stops;
    }, [scannerAngle, settings, resolution, maxR]);


    return (
        <div className="w-full h-full flex flex-col">
            <svg viewBox={`0 0 ${size.width} ${size.height}`} className="w-full flex-1" preserveAspectRatio="none">
                {colorStops}
            </svg>
            <div className="flex justify-between text-xs text-slate-400 font-mono px-1">
                <span>{t('center')}</span>
                <span>{t('edge')}</span>
            </div>
        </div>
    );
};