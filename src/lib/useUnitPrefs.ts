import { useState, useEffect } from 'react';

export type TempUnit = 'C' | 'F';
export type WeightUnit = 'kg' | 'lb';
export type VolumeUnit = 'ml' | 'oz';

export interface UnitPreferences {
  temp: TempUnit;
  weight: WeightUnit;
  volume: VolumeUnit;
}

const STORAGE_KEY = 'bbtrack_unit_prefs';

const DEFAULT_PREFS: UnitPreferences = {
  temp: 'C',
  weight: 'kg',
  volume: 'ml',
};

export const useUnitPrefs = () => {
  const [prefs, setPrefs] = useState<UnitPreferences>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_PREFS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const updatePref = <K extends keyof UnitPreferences>(key: K, value: UnitPreferences[K]) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  return { prefs, updatePref };
};
