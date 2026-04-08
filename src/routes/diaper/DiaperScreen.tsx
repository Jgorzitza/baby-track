import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, History, ChevronRight, Droplets, PenLine, Pipette } from 'lucide-react';
import { DiaperType, StoolConsistency } from '../../lib/types';
import { mockStore } from '../../lib/mockStore';

export const DiaperScreen = () => {
  const navigate = useNavigate();
  const [diaperType, setDiaperType] = useState<DiaperType>('wet');
  const [stoolConsistency, setStoolConsistency] = useState<StoolConsistency | ''>('');
  const [stoolColor, setStoolColor] = useState('');
  const [urineNote, setUrineNote] = useState('');
  const [details, setDetails] = useState({
    mucus: false,
    blood: false
  });

  const consistencies: { label: string; value: StoolConsistency }[] = [
    { label: 'Soft', value: 'soft' },
    { label: 'Watery', value: 'watery' },
    { label: 'Hard', value: 'hard' },
    { label: 'Mucus', value: 'mucus' },
    { label: 'Bloody', value: 'bloody' },
  ];

  const handleSave = () => {
    mockStore.addDiaper({
      type: 'diaper',
      diaperType,
      stoolColor: stoolColor || undefined,
      stoolConsistency: stoolConsistency || undefined,
      urineColor: urineNote || undefined,
      notes: (details.mucus || details.blood) 
        ? `Details: ${details.mucus ? 'Mucus' : ''}${details.mucus && details.blood ? ', ' : ''}${details.blood ? 'Blood' : ''}`
        : undefined
    });
    navigate('/');
  };

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
            <Droplets size={20} />
            <span>Wet</span>
          </button>
          <button 
            className={`btn flex-col ${diaperType === 'dirty' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ height: 80 }}
            onClick={() => setDiaperType('dirty')}
          >
            <PenLine size={20} />
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

        <section style={{ marginTop: '1.5rem' }}>
          {diaperType !== 'dirty' && (
            <div className="form-group">
              <label className="form-label">Urine Note</label>
              <div className="flex-row">
                <Pipette size={18} className="text-muted" />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Concentrated, pale..." 
                  value={urineNote}
                  onChange={(e) => setUrineNote(e.target.value)}
                />
              </div>
            </div>
          )}

          {(diaperType === 'dirty' || diaperType === 'both') && (
            <>
              <div className="form-group">
                <label className="form-label">Stool Consistency</label>
                <div className="flex-row" style={{ overflowX: 'auto', paddingBottom: '0.5rem', gap: '0.5rem' }}>
                  {consistencies.map(c => (
                    <button 
                      key={c.value}
                      className={`btn text-xs ${stoolConsistency === c.value ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ whiteSpace: 'nowrap', minWidth: 'auto', height: 36, padding: '0 0.75rem' }}
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
                      className={`btn text-xs ${stoolColor === color ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ height: 36 }}
                      onClick={() => setStoolColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Special Details</label>
                <div className="grid-2">
                  <button 
                    className={`btn text-xs ${details.mucus ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={() => setDetails(d => ({ ...d, mucus: !d.mucus }))}
                    style={{ height: 40 }}
                  >
                    Mucus
                  </button>
                  <button 
                    className={`btn text-xs ${details.blood ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={() => setDetails(d => ({ ...d, blood: !d.blood }))}
                    style={{ height: 40 }}
                  >
                    Blood
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <button className="btn btn-success btn-block" style={{ marginTop: '1.5rem', height: 56 }} onClick={handleSave}>
          <Check size={20} />
          <span>Save Diaper</span>
        </button>
      </div>

      <section style={{ marginTop: '1.5rem' }}>
        <div className="flex-row space-between" onClick={() => navigate('/timeline')} style={{ cursor: 'pointer' }}>
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
