import React from 'react';
import { RadialSlice } from './components/RadialSlice';
import { useSettings } from '../../contexts/SettingsContext';
import { useTranslation } from '../../i18n';

const Visualizer1D: React.FC = () => {
  const settings = useSettings();
  const { t } = useTranslation();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-slate-300">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">{t('radialSliceView')}</h3>
      <div className="w-full flex-1">
        <RadialSlice {...settings} />
      </div>
    </div>
  );
};

export default Visualizer1D;