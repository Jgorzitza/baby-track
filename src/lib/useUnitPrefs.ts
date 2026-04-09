import { useState, useEffect } from 'react';

export type TempUnit = 'C' | 'F';
export type WeightUnit = 'kg' | 'lb';
export type VolumeUnit = 'ml' | 'oz';
export type LengthUnit = 'cm' | 'in';

export interface UnitPreferences {
  temp: TempUnit;
  weight: WeightUnit;
  volume: VolumeUnit;
  length: LengthUnit;
}

const STORAGE_KEY = 'bbtrack_unit_prefs';

const DEFAULT_PREFS: UnitPreferences = {
  temp: 'C',
  weight: 'kg',
  volume: 'ml',
  length: 'cm',
};

const isTempUnit = (value: unknown): value is TempUnit => value === 'C' || value === 'F';

const isWeightUnit = (value: unknown): value is WeightUnit => value === 'kg' || value === 'lb';

const isVolumeUnit = (value: unknown): value is VolumeUnit => value === 'ml' || value === 'oz';
const isLengthUnit = (value: unknown): value is LengthUnit => value === 'cm' || value === 'in';

const isUnitPreferences = (value: unknown): value is UnitPreferences => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    isTempUnit(candidate.temp) &&
    isWeightUnit(candidate.weight) &&
    isVolumeUnit(candidate.volume) &&
    isLengthUnit(candidate.length)
  );
};

const readStoredPrefs = (): UnitPreferences => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return DEFAULT_PREFS;
  }

  try {
    const parsed: unknown = JSON.parse(saved);
    return isUnitPreferences(parsed) ? parsed : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
};

export const useUnitPrefs = () => {
  const [prefs, setPrefs] = useState<UnitPreferences>(readStoredPrefs);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const updatePref = <K extends keyof UnitPreferences>(key: K, value: UnitPreferences[K]) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  return { prefs, updatePref };
};
