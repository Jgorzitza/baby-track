import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockAppointments } from '../../lib/mockData';

export const DoctorQuestionsScreen = () => {
  const navigate = useNavigate();
  const appointment = mockAppointments[0];

  return (
    <div className="doctor-questions-screen">
      <div className="flex-row" style={{ marginBottom: '1.5rem' }} onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        <span className="font-bold">Back to Doctor Mode</span>
      </div>

      <div className="card">
        <h3>Questions for {appointment.provider}</h3>
        <p className="text-muted text-sm">Prepare these questions before your next visit.</p>
      </div>

      <section>
        {appointment.questions.map((q, i) => (
          <div key={i} className="card flex-row space-between" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
            <span className="text-sm">{q}</span>
            <Trash2 size={18} className="text-danger" style={{ opacity: 0.6 }} />
          </div>
        ))}
      </section>

      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="form-group">
          <label className="form-label">New Question</label>
          <textarea className="form-control" placeholder="What would you like to ask?"></textarea>
        </div>
        <button className="btn btn-primary btn-block">
          <Plus size={20} />
          <span>Add Question</span>
        </button>
      </div>
    </div>
  );
};
