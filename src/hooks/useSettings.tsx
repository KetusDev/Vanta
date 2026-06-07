import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  DEFAULT_SETTINGS,
  type AppSettings,
} from "../types/metrics";

const STORAGE_KEY = "vanta-settings";

type SettingsContextValue = {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
};

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  resetSettings: () => {},
});

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    getCurrentWindow()
      .setAlwaysOnTop(settings.alwaysOnTop)
      .catch((error) => console.error("Failed to set always on top", error));
  }, [settings.alwaysOnTop]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "transparent-window",
      settings.transparentWindow,
    );
  }, [settings.transparentWindow]);

  useEffect(() => {
    let active = true;

    const syncAutostart = async () => {
      try {
        const enabled = await isEnabled();
        if (!active) {
          return;
        }

        if (settings.autostart && !enabled) {
          await enable();
        } else if (!settings.autostart && enabled) {
          await disable();
        }
      } catch (error) {
        console.error("Failed to sync autostart", error);
      }
    };

    syncAutostart();
    return () => {
      active = false;
    };
  }, [settings.autostart]);

  const updateSettings = (patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
