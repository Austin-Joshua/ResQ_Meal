import React, { useState } from 'react';
import { useMode, MODE_METADATA, UserMode } from '@/context/ModeContext';
import { Grid2x2, ChevronRight } from 'lucide-react';

interface ModeSwitcherProps {
  darkMode: boolean;
  onModeSwitch?: (mode: UserMode) => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ darkMode, onModeSwitch }) => {
  const { currentMode, switchMode } = useMode();
  const [showPicker, setShowPicker] = useState(false);

  const handleModeChange = (mode: UserMode) => {
    switchMode(mode);
    setShowPicker(false);
    onModeSwitch?.(mode);
  };

  const modes: UserMode[] = ['volunteer', 'restaurant', 'ngo', 'admin'];

  return (
    <div className="relative">
      {/* Mode Switcher Button */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition ${
          darkMode
            ? 'bg-blue-900/30 border-[#D4AF37]/50 text-[#D4AF37] hover:bg-blue-900/50 hover:border-[#D4AF37]'
            : 'bg-blue-50 border-[#D4AF37] text-blue-700 hover:bg-blue-100'
        }`}
      >
        <Grid2x2 className="w-4 h-4" />
        <span className="text-sm font-semibold">{currentMode ? MODE_METADATA[currentMode].label : 'Select Mode'}</span>
        <ChevronRight className={`w-4 h-4 transition ${showPicker ? 'rotate-90' : ''}`} />
      </button>

      {/* Mode Picker Dropdown */}
      {showPicker && (
        <div
          className={`absolute top-full mt-2 left-0 rounded-lg border-2 shadow-xl z-50 overflow-hidden min-w-[280px] ${
            darkMode
              ? 'bg-gradient-to-br from-blue-900/80 to-blue-950/80 border-[#D4AF37]/30'
              : 'bg-white border-blue-200'
          }`}
        >
          <div className={`p-3 border-b ${darkMode ? 'border-slate-700 bg-blue-900/50' : 'border-blue-100 bg-blue-50'}`}>
            <p className={`text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Switch Dashboard Mode
            </p>
          </div>

          <div className="p-2 space-y-1">
            {modes.map((mode) => (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg transition text-left ${
                  currentMode === mode
                    ? darkMode
                      ? 'bg-[#D4AF37]/20 border border-[#D4AF37] shadow-md'
                      : 'bg-[#D4AF37]/10 border border-[#D4AF37]'
                    : darkMode
                    ? 'hover:bg-slate-700/30 border border-transparent'
                    : 'hover:bg-slate-100 border border-transparent'
                }`}
              >
                <span className="text-lg mt-0.5">{MODE_METADATA[mode].icon}</span>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {MODE_METADATA[mode].label}
                  </p>
                  <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {MODE_METADATA[mode].description}
                  </p>
                </div>
                {currentMode === mode && (
                  <div className={`w-2 h-2 rounded-full mt-0.5 ${darkMode ? 'bg-[#D4AF37]' : 'bg-blue-600'}`} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showPicker && (
        <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
      )}
    </div>
  );
};
