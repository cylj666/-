import React, { useRef, useMemo } from 'react';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { Controls } from './visualizers/v2D/components/Controls';
import Visualizer2D from './visualizers/v2D';
import Visualizer1D from './visualizers/v1D';
import { useTranslation } from './i18n';

const AppContent: React.FC = () => {
  const { t } = useTranslation();
  const settings = useSettings();
  const mainRef = useRef<HTMLElement>(null);

  // Memoize control props to prevent re-renders of the entire control panel on every animation frame.
  const controlProps = useMemo(() => {
    return {
        ...settings,
        onToggleFullscreen: () => {
          if (!mainRef.current) return;
          if (!document.fullscreenElement) {
            mainRef.current.requestFullscreen().catch(err => {
              console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
          } else {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            }
          }
        },
    };
  }, [settings]);


  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row items-stretch transition-colors duration-300 overflow-hidden">
      <header className="w-full lg:hidden p-4 bg-slate-800 border-b border-slate-700 shadow-md">
        <h1 className="text-2xl font-bold text-slate-100 text-center">{t('interactiveColorWheel')}</h1>
      </header>

      <aside className="w-full lg:w-96 bg-slate-800 p-6 shadow-lg lg:shadow-2xl flex-shrink-0 overflow-y-auto">
        <div className="sticky top-6">
          <div className="mb-8 hidden lg:block">
            <h1 className="text-3xl font-bold text-slate-200">{t('interactive')}</h1>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{t('colorWheel')}</h2>
          </div>
          <Controls {...controlProps} />
        </div>
      </aside>

      <main ref={mainRef} className={`relative flex-1 flex flex-col items-stretch justify-center transition-colors duration-300 ${settings.canvasBackgroundColor === 'black' ? 'bg-black' : 'bg-white'}`}>
        <div className="flex-grow flex items-center justify-center p-4 sm:p-8 lg:p-12 min-h-0">
          <Visualizer2D />
        </div>
        <div className="flex-shrink-0 h-40 bg-slate-900/50 border-t-2 border-slate-700">
          <Visualizer1D />
        </div>
      </main>
    </div>
  );
};


const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
};

export default App;