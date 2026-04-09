import { useState } from 'react';
import { BarChart2, Calendar, ChevronRight, Droplets, Moon, Baby, Heart, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReportsSummary } from '../../lib/app-hooks';
import { TrendChart } from '../../components/charts/TrendChart';
import { formatElapsedClock } from '../../lib/time';
import { buildReportsTrendSeries, type TrendMetric } from '../../lib/trends';

export const ReportsScreen = () => {
  const navigate = useNavigate();
  const { reportsSummary, reportsWindowDays, setReportsWindowDays } = useReportsSummary();
  const reportSeries = buildReportsTrendSeries(reportsSummary.timeline, reportsWindowDays);
  const [selectedMetric, setSelectedMetric] = useState<TrendMetric>('feed');
  const selectedSeries = reportSeries.find((series) => series.metric === selectedMetric) ?? reportSeries[0];

  return (
    <div className="reports-screen">
      <div className="card" style={{ background: 'linear-gradient(135deg, #f8fbff, #e8f4ff)' }}>
        <div className="flex-row">
          <Calendar className="text-primary" size={24} />
          <div>
            <h3 style={{ marginBottom: 0 }}>Weekly Insights</h3>
            <p className="text-muted text-sm">{reportsSummary.windowLabel}</p>
          </div>
        </div>
        <div className="flex-row" style={{ gap: '0.5rem', marginTop: '1rem' }}>
          {([7, 14, 30] as const).map((windowDays) => (
            <button
              key={windowDays}
              className={`btn text-xs ${reportsWindowDays === windowDays ? 'btn-primary' : 'btn-secondary'}`}
              style={{ minHeight: 36, padding: '0 0.875rem' }}
              onClick={() => void setReportsWindowDays(windowDays)}
            >
              {windowDays} days
            </button>
          ))}
        </div>
      </div>

      {selectedSeries && (
        <section style={{ marginTop: '1.5rem' }}>
          <div className="flex-row space-between" style={{ marginBottom: '0.75rem' }}>
            <h4>Trend Explorer</h4>
            <span className="text-xs text-muted">Visualize changes over time</span>
          </div>
          <div className="flex-row" style={{ gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', marginBottom: '0.75rem' }}>
            {reportSeries.map((series) => (
              <button
                key={series.metric}
                type="button"
                className={`btn text-xs ${selectedSeries.metric === series.metric ? 'btn-primary' : 'btn-secondary'}`}
                style={{ minHeight: 36, padding: '0 0.875rem', whiteSpace: 'nowrap' }}
                onClick={() => setSelectedMetric(series.metric)}
              >
                {series.title.replace(' Over Time', '').replace(' Sessions', '').replace(' Activity', '')}
              </button>
            ))}
          </div>
          <TrendChart series={selectedSeries} />
        </section>
      )}

      <section>
        <h4>Activity Summaries</h4>
        <div className="flex-col" style={{ gap: '0.75rem' }}>
          <button className="card" style={{ marginBottom: 0, textAlign: 'left', border: '1px solid var(--border)', width: '100%' }} onClick={() => navigate('/sleep')}>
            <div className="flex-row space-between">
              <div className="flex-row">
                <div className="btn btn-secondary btn-icon" style={{ backgroundColor: '#eef2ff', width: 40, height: 40 }}>
                  <Moon size={18} className="text-primary" />
                </div>
                <div>
                  <div className="font-bold text-sm">Sleep</div>
                  <div className="text-xs text-muted">{formatElapsedClock(reportsSummary.sleepDailyAverageSeconds)} daily avg</div>
                  {selectedSeries?.metric === 'sleep' && (
                    <div className="text-xs text-primary" style={{ marginTop: '0.25rem' }}>
                      Peak day: {selectedSeries.peakValue} sessions
                    </div>
                  )}
                </div>
              </div>
              <ChevronRight size={18} className="text-muted" />
            </div>
          </button>

          <button className="card" style={{ marginBottom: 0, textAlign: 'left', border: '1px solid var(--border)', width: '100%' }} onClick={() => navigate('/feed')}>
            <div className="flex-row space-between">
              <div className="flex-row">
                <div className="btn btn-secondary btn-icon" style={{ backgroundColor: '#fff1f2', width: 40, height: 40 }}>
                  <Droplets size={18} className="text-danger" />
                </div>
                <div>
                  <div className="font-bold text-sm">Feeding</div>
                  <div className="text-xs text-muted">{reportsSummary.feedDailyAverage} sessions daily avg</div>
                  {selectedSeries?.metric === 'feed' && (
                    <div className="text-xs text-danger" style={{ marginTop: '0.25rem' }}>
                      Total window feeds: {selectedSeries.totalValue}
                    </div>
                  )}
                </div>
              </div>
              <ChevronRight size={18} className="text-muted" />
            </div>
          </button>

          <button className="card" style={{ marginBottom: 0, textAlign: 'left', border: '1px solid var(--border)', width: '100%' }} onClick={() => navigate('/diaper')}>
            <div className="flex-row space-between">
              <div className="flex-row">
                <div className="btn btn-secondary btn-icon" style={{ backgroundColor: '#f0fdf4', width: 40, height: 40 }}>
                  <Baby size={18} className="text-success" />
                </div>
                <div>
                  <div className="font-bold text-sm">Diapers</div>
                  <div className="text-xs text-muted">{reportsSummary.diaperDailyAverage} daily avg</div>
                  {selectedSeries?.metric === 'diaper' && (
                    <div className="text-xs text-success" style={{ marginTop: '0.25rem' }}>
                      Busiest day: {selectedSeries.peakValue} changes
                    </div>
                  )}
                </div>
              </div>
              <ChevronRight size={18} className="text-muted" />
            </div>
          </button>
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h4>Health & Symptoms</h4>
        <div className="grid-2">
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="flex-row text-xs text-muted" style={{ marginBottom: '4px' }}>
              <Heart size={14} className="text-danger" /> <span>Medications</span>
            </div>
            <div className="font-bold">{reportsSummary.medicationCount} Doses</div>
            <div className="text-xs text-muted">{reportsSummary.lastMedicationSummary ?? 'No medication logs yet'}</div>
            {selectedSeries?.metric === 'medication' && (
              <div className="text-xs text-danger" style={{ marginTop: '0.5rem' }}>
                Highest day: {selectedSeries.peakValue} doses
              </div>
            )}
          </div>
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="flex-row text-xs text-muted" style={{ marginBottom: '4px' }}>
              <Activity size={14} className="text-warning" /> <span>Symptoms</span>
            </div>
            <div className="font-bold">{reportsSummary.symptomCount} Noted</div>
            <div className="text-xs text-muted">{reportsSummary.latestSymptomSummary ?? 'No symptoms logged yet'}</div>
            {selectedSeries?.metric === 'symptom' && (
              <div className="text-xs text-warning" style={{ marginTop: '0.5rem' }}>
                Highest day: {selectedSeries.peakValue} symptoms
              </div>
            )}
          </div>
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <div className="flex-row space-between" onClick={() => navigate('/timeline')}>
          <h4>Medical Timeline</h4>
          <span className="text-xs text-primary font-bold">View All</span>
        </div>
        <div className="card" style={{ padding: '0' }}>
          {reportsSummary.timeline.slice(0, 4).map((item, index, list) => (
            <div key={item.id} className="flex-row" style={{ padding: '1rem', borderBottom: index === list.length - 1 ? 'none' : '1px solid var(--border)' }}>
              <div style={{ width: '4px', height: '32px', backgroundColor: item.eventType === 'temperature' ? 'var(--danger)' : 'var(--primary)', borderRadius: '2px', marginRight: '0.75rem' }} />
              <div style={{ flex: 1 }}>
                <div className="flex-row space-between">
                  <span className="text-xs text-muted font-bold">{new Date(item.occurredAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  <span className="text-xs text-muted">{new Date(item.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="text-sm font-bold" style={{ marginTop: '2px' }}>{item.title}</div>
                <div className="text-xs text-muted">{item.summary ?? 'Tracked event'}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ marginTop: '1.5rem' }}>
        <button className="btn btn-secondary btn-block" onClick={() => navigate('/timeline')}>
          <BarChart2 size={20} />
          <span>Detailed Trends</span>
        </button>
      </div>
    </div>
  );
};
