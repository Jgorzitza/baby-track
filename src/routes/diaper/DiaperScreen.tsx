import { useState } from 'react';
import { Check, History, ChevronRight } from 'lucide-react';
import { DiaperType, StoolConsistency } from '../../lib/types';

export const DiaperScreen = () => {
  const [diaperType, setDiaperType] = useState<DiaperType>('wet');
  const [stoolConsistency, setStoolConsistency] = useState<StoolConsistency | ''>('');
  const [stoolColor, setStoolColor] = useState('');

  const consistencies: { label: string; value: StoolConsistency }[] = [
    { label: 'Soft', value: 'soft' },
    { label: 'Watery', value: 'watery' },
    { label: 'Hard', value: 'hard' },
    { label: 'Mucus', value: 'mucus' },
    { label: 'Bloody', value: 'bloody' },
  ];

  return (
    <div className="diaper-screen">
      <div className="card">
        <h3>Log Diaper</h3>
        <div className="grid-3" style={{ margin: '1rem 0' }}>
          <button 
            className={`btn flex-col ${diaperType === 'wet' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ height: 80 }}
            onClick={() => setDiaperType('wet')}
          >
            <span>Wet</span>
          </button>
          <button 
            className={`btn flex-col ${diaperType === 'dirty' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ height: 80 }}
            onClick={() => setDiaperType('dirty')}
          >
            <span>Dirty</span>
          </button>
          <button 
            className={`btn flex-col ${diaperType === 'both' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ height: 80 }}
            onClick={() => setDiaperType('both')}
          >
            <span>Both</span>
          </button>
        </div>

        {(diaperType === 'dirty' || diaperType === 'both') && (
          <section style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Stool Consistency</label>
              <div className="flex-row" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {consistencies.map(c => (
                  <button 
                    key={c.value}
                    className={`btn text-sm ${stoolConsistency === c.value ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ whiteSpace: 'nowrap', minWidth: 'auto', height: 40 }}
                    onClick={() => setStoolConsistency(c.value)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Stool Color</label>
              <div className="grid-3">
                {['Yellow', 'Mustard', 'Brown', 'Green', 'Black'].map(color => (
                  <button 
                    key={color}
                    className={`btn text-sm ${stoolColor === color ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ height: 40 }}
                    onClick={() => setStoolColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <button className="btn btn-success btn-block" style={{ marginTop: '1.5rem', height: 56 }}>
          <Check size={20} />
          <span>Save Diaper</span>
        </button>
      </div>

      <section style={{ marginTop: '1.5rem' }}>
        <div className="flex-row space-between">
          <h4>Today's Count</h4>
          <span className="text-sm text-primary">View History</span>
        </div>
        <div className="grid-2">
          <div className="card text-center">
            <div className="text-xs text-muted">Wet</div>
            <div className="font-bold" style={{ fontSize: '1.5rem' }}>4</div>
          </div>
          <div className="card text-center">
            <div className="text-xs text-muted">Dirty</div>
            <div className="font-bold" style={{ fontSize: '1.5rem' }}>2</div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h4>Last Diaper</h4>
        <div className="card">
          <div className="flex-row space-between">
            <div className="flex-row">
              <History size={18} className="text-muted" />
              <div>
                <div className="font-bold">Wet Diaper</div>
                <div className="text-xs text-muted">9:15 AM (2h 30m ago)</div>
              </div>
            </div>
            <ChevronRight size={20} className="text-muted" />
          </div>
        </div>
      </section>
    </div>
  );
};
