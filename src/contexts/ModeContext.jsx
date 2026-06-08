import { createContext, useContext, useState, useEffect } from 'react';

const ModeContext = createContext(null);

export function ModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('appMode') || 'chama';
  });

  useEffect(() => {
    localStorage.setItem('appMode', mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'chama' ? 'invest' : 'chama'));
  };

  const setModeExplicit = (newMode) => {
    if (newMode === 'chama' || newMode === 'invest') {
      setMode(newMode);
    }
  };

  const value = {
    mode,
    isChamaMode: mode === 'chama',
    isInvestMode: mode === 'invest',
    toggleMode,
    setMode: setModeExplicit,
  };

  return (
    <ModeContext.Provider value={value}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}