
import React, { createContext, useContext, useState, useEffect } from 'react';

export type SeoPlugin = 'rankmath' | 'yoast' | 'aioseo' | 'none';

interface SeoPluginContextType {
  selectedPlugin: SeoPlugin | null;
  setSelectedPlugin: (plugin: SeoPlugin) => void;
}

const SeoPluginContext = createContext<SeoPluginContextType | undefined>(undefined);

export const useSeoPlugin = () => {
  const context = useContext(SeoPluginContext);
  if (context === undefined) {
    throw new Error('useSeoPlugin must be used within a SeoPluginProvider');
  }
  return context;
};

export const SeoPluginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedPlugin, setSelectedPluginState] = useState<SeoPlugin | null>(null);

  // Load saved plugin from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('selectedSeoPlugin');
    if (saved && ['rankmath', 'yoast', 'aioseo', 'none'].includes(saved)) {
      setSelectedPluginState(saved as SeoPlugin);
    }
  }, []);

  const setSelectedPlugin = (plugin: SeoPlugin) => {
    setSelectedPluginState(plugin);
    localStorage.setItem('selectedSeoPlugin', plugin);
  };

  return (
    <SeoPluginContext.Provider value={{ selectedPlugin, setSelectedPlugin }}>
      {children}
    </SeoPluginContext.Provider>
  );
};
