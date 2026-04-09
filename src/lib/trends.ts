import type {
  DoctorSummary,
  GrowthMeasurement,
  MedicalTimelineEvent,
  MedicationEvent,
  ReportsWindowDays,
  SymptomEvent,
  TemperatureEvent,
} from './types';

export type TrendMetric =
  | 'feed'
  | 'sleep'
  | 'diaper'
  | 'temperature'
  | 'medication'
  | 'symptom'
  | 'appointment'
  | 'growth-weight'
  | 'growth-length';

export interface TrendPoint {
  isoDate: string;
  label: string;
  shortLabel: string;
  value: number;
}

export interface TrendSeries {
  metric: TrendMetric;
  title: string;
  subtitle: string;
  points: TrendPoint[];
  kind: 'bar' | 'line';
  tone: 'primary' | 'success' | 'warning' | 'danger';
  unitLabel: string;
  latestValue: number | null;
  averageValue: number;
  peakValue: number;
  totalValue: number;
  emptyMessage: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfLocalDay = (value: Date): Date => new Date(value.getFullYear(), value.getMonth(), value.getDate());

const formatShortDay = (date: Date): string =>
  date.toLocaleDateString([], { month: 'short', day: 'numeric' });

const formatDetailedDay = (date: Date): string =>
  date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

const buildDayBuckets = (days: number): TrendPoint[] => {
  const today = startOfLocalDay(new Date());
  const points: TrendPoint[] = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today.getTime() - index * DAY_MS);
    points.push({
      isoDate: date.toISOString(),
      label: formatDetailedDay(date),
      shortLabel: formatShortDay(date),
      value: 0,
    });
  }

  return points;
};

const buildCountSeries = (
  metric: TrendMetric,
  title: string,
  subtitle: string,
  tone: TrendSeries['tone'],
  unitLabel: string,
  days: number,
  timestamps: string[],
  emptyMessage: string
): TrendSeries => {
  const points = buildDayBuckets(days);
  const pointIndex = new Map(points.map((point, index) => [startOfLocalDay(new Date(point.isoDate)).toISOString().slice(0, 10), index]));

  for (const timestamp of timestamps) {
    const dayKey = startOfLocalDay(new Date(timestamp)).toISOString().slice(0, 10);
    const index = pointIndex.get(dayKey);
    if (index !== undefined) {
      points[index] = {
        ...points[index],
        value: points[index].value + 1,
      };
    }
  }

  const values = points.map((point) => point.value);
  const totalValue = values.reduce((sum, value) => sum + value, 0);
  const peakValue = values.length > 0 ? Math.max(...values) : 0;
  const latestValue = points.length > 0 ? points[points.length - 1].value : null;

  return {
    metric,
    title,
    subtitle,
    points,
    kind: 'bar',
    tone,
    unitLabel,
    latestValue,
    averageValue: points.length > 0 ? totalValue / points.length : 0,
    peakValue,
    totalValue,
    emptyMessage,
  };
};

const buildValueSeries = (
  metric: TrendMetric,
  title: string,
  subtitle: string,
  tone: TrendSeries['tone'],
  unitLabel: string,
  records: Array<{ occurredAt: string; value: number }>,
  emptyMessage: string
): TrendSeries => {
  const sorted = [...records].sort((left, right) => left.occurredAt.localeCompare(right.occurredAt));
  const points = sorted.map((record) => {
    const date = new Date(record.occurredAt);
    return {
      isoDate: record.occurredAt,
      label: date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      shortLabel: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      value: record.value,
    };
  });

  const values = points.map((point) => point.value);
  const totalValue = values.reduce((sum, value) => sum + value, 0);
  const peakValue = values.length > 0 ? Math.max(...values) : 0;
  const latestValue = points.length > 0 ? points[points.length - 1].value : null;

  return {
    metric,
    title,
    subtitle,
    points,
    kind: 'line',
    tone,
    unitLabel,
    latestValue,
    averageValue: points.length > 0 ? totalValue / points.length : 0,
    peakValue,
    totalValue,
    emptyMessage,
  };
};

const windowDaysFromDoctorWindow = (windowLabel: DoctorSummary['windowLabel']): number =>
  windowLabel === '24h' ? 1 : windowLabel === '48h' ? 2 : 7;

const cutoffIso = (days: number): string => new Date(Date.now() - days * DAY_MS).toISOString();

const filterTimelineTimestamps = (
  timeline: MedicalTimelineEvent[],
  eventTypes: MedicalTimelineEvent['eventType'][],
  sinceIso: string
): string[] =>
  timeline
    .filter((event) => event.occurredAt >= sinceIso && eventTypes.includes(event.eventType))
    .map((event) => event.occurredAt);

const filterMeasurementRecords = <T extends { occurredAt: string }>(
  records: T[],
  sinceIso: string
): T[] => records.filter((record) => record.occurredAt >= sinceIso);

export const buildReportsTrendSeries = (
  timeline: MedicalTimelineEvent[],
  windowDays: ReportsWindowDays
): TrendSeries[] => {
  const sinceIso = cutoffIso(windowDays);

  return [
    buildCountSeries(
      'feed',
      'Feeds Over Time',
      `${windowDays}-day session count`,
      'danger',
      'feeds',
      windowDays,
      filterTimelineTimestamps(timeline, ['feed'], sinceIso),
      'No feed activity logged in this reporting window.'
    ),
    buildCountSeries(
      'sleep',
      'Sleep Sessions Over Time',
      `${windowDays}-day session count`,
      'primary',
      'sessions',
      windowDays,
      filterTimelineTimestamps(timeline, ['sleep'], sinceIso),
      'No completed sleep sessions in this reporting window.'
    ),
    buildCountSeries(
      'diaper',
      'Diaper Changes Over Time',
      `${windowDays}-day change count`,
      'success',
      'changes',
      windowDays,
      filterTimelineTimestamps(timeline, ['diaper'], sinceIso),
      'No diaper changes logged in this reporting window.'
    ),
    buildCountSeries(
      'medication',
      'Medication Activity',
      `${windowDays}-day dose count`,
      'warning',
      'doses',
      windowDays,
      filterTimelineTimestamps(timeline, ['medication'], sinceIso),
      'No medication logs in this reporting window.'
    ),
    buildCountSeries(
      'symptom',
      'Symptoms Over Time',
      `${windowDays}-day symptom count`,
      'warning',
      'symptoms',
      windowDays,
      filterTimelineTimestamps(timeline, ['symptom'], sinceIso),
      'No symptom logs in this reporting window.'
    ),
  ];
};

export const buildDoctorTrendSeries = (doctorSummary: DoctorSummary): TrendSeries[] => {
  const windowDays = windowDaysFromDoctorWindow(doctorSummary.windowLabel);
  const sinceIso = cutoffIso(windowDays);
  const temperatures = filterMeasurementRecords(doctorSummary.temperatures, sinceIso);
  const growthMeasurements = filterMeasurementRecords(doctorSummary.growthMeasurements, sinceIso);

  const series: TrendSeries[] = [
    buildCountSeries(
      'feed',
      'Feeding Activity',
      `${doctorSummary.windowLabel} feed sessions`,
      'danger',
      'feeds',
      windowDays,
      filterTimelineTimestamps(doctorSummary.timeline, ['feed'], sinceIso),
      'No feeding activity in this doctor summary window.'
    ),
    buildCountSeries(
      'sleep',
      'Sleep Activity',
      `${doctorSummary.windowLabel} sleep sessions`,
      'primary',
      'sessions',
      windowDays,
      filterTimelineTimestamps(doctorSummary.timeline, ['sleep'], sinceIso),
      'No sleep sessions in this doctor summary window.'
    ),
    buildCountSeries(
      'diaper',
      'Diaper Activity',
      `${doctorSummary.windowLabel} diaper changes`,
      'success',
      'changes',
      windowDays,
      filterTimelineTimestamps(doctorSummary.timeline, ['diaper'], sinceIso),
      'No diaper changes in this doctor summary window.'
    ),
    buildCountSeries(
      'appointment',
      'Appointments & Notes',
      `${doctorSummary.windowLabel} visit activity`,
      'primary',
      'events',
      windowDays,
      filterTimelineTimestamps(doctorSummary.timeline, ['appointment', 'note'], sinceIso),
      'No doctor appointment activity in this summary window.'
    ),
    buildCountSeries(
      'medication',
      'Medication Activity',
      `${doctorSummary.windowLabel} medications`,
      'warning',
      'doses',
      windowDays,
      filterMeasurementRecords(doctorSummary.medications, sinceIso).map((event: MedicationEvent) => event.occurredAt),
      'No medication activity in this doctor summary window.'
    ),
    buildCountSeries(
      'symptom',
      'Symptoms Over Time',
      `${doctorSummary.windowLabel} symptom logs`,
      'warning',
      'symptoms',
      windowDays,
      filterMeasurementRecords(doctorSummary.symptoms, sinceIso).map((event: SymptomEvent) => event.occurredAt),
      'No symptom activity in this doctor summary window.'
    ),
  ];

  if (temperatures.length > 0) {
    series.push(
      buildValueSeries(
        'temperature',
        'Temperature Readings',
        `${doctorSummary.windowLabel} temperature trend`,
        'danger',
        temperatures[0].unit,
        temperatures.map((event: TemperatureEvent) => ({ occurredAt: event.occurredAt, value: event.value })),
        'No temperatures available to chart.'
      )
    );
  }

  const weightRecords = growthMeasurements
    .filter((measurement: GrowthMeasurement) => measurement.weight !== null)
    .map((measurement: GrowthMeasurement) => ({
      occurredAt: measurement.occurredAt,
      value: measurement.weight ?? 0,
    }));
  if (weightRecords.length > 0) {
    series.push(
      buildValueSeries(
        'growth-weight',
        'Weight Trend',
        `${doctorSummary.windowLabel} growth check-ins`,
        'primary',
        growthMeasurements.find((measurement) => measurement.weightUnit)?.weightUnit ?? 'kg',
        weightRecords,
        'No weight measurements available to chart.'
      )
    );
  }

  const lengthRecords = growthMeasurements
    .filter((measurement: GrowthMeasurement) => measurement.length !== null)
    .map((measurement: GrowthMeasurement) => ({
      occurredAt: measurement.occurredAt,
      value: measurement.length ?? 0,
    }));
  if (lengthRecords.length > 0) {
    series.push(
      buildValueSeries(
        'growth-length',
        'Length Trend',
        `${doctorSummary.windowLabel} growth check-ins`,
        'success',
        growthMeasurements.find((measurement) => measurement.lengthUnit)?.lengthUnit ?? 'cm',
        lengthRecords,
        'No length measurements available to chart.'
      )
    );
  }

  return series;
};

export const metricFromTimelineEvent = (eventType: MedicalTimelineEvent['eventType']): TrendMetric => {
  if (eventType === 'temperature') {
    return 'temperature';
  }
  if (eventType === 'medication') {
    return 'medication';
  }
  if (eventType === 'symptom') {
    return 'symptom';
  }
  if (eventType === 'growth') {
    return 'growth-weight';
  }
  if (eventType === 'appointment' || eventType === 'note') {
    return 'appointment';
  }
  return eventType;
};
