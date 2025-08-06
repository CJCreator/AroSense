import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import Button from './ui/Button';
import { useToast } from './ui/Toast';

interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  darkMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

const THEME_PRESETS = {
  default: { primaryColor: '#0ea5e9', accentColor: '#ec4899', fontSize: 'medium' as const },
  health: { primaryColor: '#22c55e', accentColor: '#ef4444', fontSize: 'medium' as const },
  wellness: { primaryColor: '#a855f7', accentColor: '#f59e0b', fontSize: 'medium' as const },
  accessibility: { primaryColor: '#1f2937', accentColor: '#059669', fontSize: 'large' as const }
};

export const ThemeCustomizer: React.FC = () => {
  const [theme, setTheme] = useState<ThemeConfig>({
    primaryColor: '#0ea5e9',
    accentColor: '#ec4899',
    fontSize: 'medium',
    darkMode: false,
    highContrast: false,
    reducedMotion: false
  });
  const { showToast } = useToast();

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('arosense_theme');
    if (savedTheme) {
      setTheme(JSON.parse(savedTheme));
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (themeConfig: ThemeConfig) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--color-primary', themeConfig.primaryColor);
    root.style.setProperty('--color-accent', themeConfig.accentColor);
    
    // Apply classes
    root.classList.toggle('dark', themeConfig.darkMode);
    root.classList.toggle('high-contrast', themeConfig.highContrast);
    root.classList.toggle('reduce-motion', themeConfig.reducedMotion);
    root.classList.toggle('text-small', themeConfig.fontSize === 'small');
    root.classList.toggle('text-large', themeConfig.fontSize === 'large');
  };

  const saveTheme = () => {
    localStorage.setItem('arosense_theme', JSON.stringify(theme));
    showToast('Theme preferences saved!', 'success');
  };

  const applyPreset = (presetName: keyof typeof THEME_PRESETS) => {
    const preset = THEME_PRESETS[presetName];
    setTheme(prev => ({ ...prev, ...preset }));
    showToast(`${presetName.charAt(0).toUpperCase() + presetName.slice(1)} theme applied!`, 'success');
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Theme Customization</h3>
      
      {/* Theme Presets */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Quick Presets</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(THEME_PRESETS).map(([name, preset]) => (
            <button
              key={name}
              onClick={() => applyPreset(name as keyof typeof THEME_PRESETS)}
              className="p-3 border rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-2 mb-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: preset.primaryColor }}
                />
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: preset.accentColor }}
                />
              </div>
              <div className="text-sm font-medium capitalize">{name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Color Customization */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Colors</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={theme.primaryColor}
                onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={theme.primaryColor}
                onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accent Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={theme.accentColor}
                onChange={(e) => setTheme(prev => ({ ...prev, accentColor: e.target.value }))}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={theme.accentColor}
                onChange={(e) => setTheme(prev => ({ ...prev, accentColor: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Typography</h4>
        <div className="flex space-x-4">
          {(['small', 'medium', 'large'] as const).map(size => (
            <label key={size} className="flex items-center space-x-2">
              <input
                type="radio"
                name="fontSize"
                value={size}
                checked={theme.fontSize === size}
                onChange={(e) => setTheme(prev => ({ ...prev, fontSize: e.target.value as any }))}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="capitalize">{size}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Accessibility Options */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Accessibility</h4>
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={theme.darkMode}
              onChange={(e) => setTheme(prev => ({ ...prev, darkMode: e.target.checked }))}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span>Dark Mode</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={theme.highContrast}
              onChange={(e) => setTheme(prev => ({ ...prev, highContrast: e.target.checked }))}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span>High Contrast</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={theme.reducedMotion}
              onChange={(e) => setTheme(prev => ({ ...prev, reducedMotion: e.target.checked }))}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span>Reduce Motion</span>
          </label>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Preview</h4>
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center space-x-4 mb-3">
            <div 
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: theme.primaryColor }}
            />
            <div>
              <div className="font-semibold" style={{ color: theme.primaryColor }}>
                Primary Color
              </div>
              <div className="text-sm text-gray-600">Sample text with primary color</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div 
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: theme.accentColor }}
            />
            <div>
              <div className="font-semibold" style={{ color: theme.accentColor }}>
                Accent Color
              </div>
              <div className="text-sm text-gray-600">Sample text with accent color</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <Button variant="primary" onClick={saveTheme} className="flex-1">
          Save Theme
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => {
            setTheme({
              primaryColor: '#0ea5e9',
              accentColor: '#ec4899',
              fontSize: 'medium',
              darkMode: false,
              highContrast: false,
              reducedMotion: false
            });
          }}
        >
          Reset
        </Button>
      </div>
    </Card>
  );
};