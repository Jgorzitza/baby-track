import { useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDoctorSummary } from '../../lib/app-hooks';

export const DoctorQuestionsScreen = () => {
  const navigate = useNavigate();
  const { doctorSummary, selectedDoctorAppointmentId, setSelectedDoctorAppointment, addDoctorQuestion, deleteDoctorQuestion } = useDoctorSummary();
  const [question, setQuestion] = useState('');

  return (
    <div className="doctor-questions-screen">
      <div className="flex-row" style={{ marginBottom: '1.5rem', cursor: 'pointer' }} onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        <span className="font-bold">Back to Doctor Mode</span>
      </div>

      <div className="card">
        <h3>Questions for {doctorSummary.appointment?.provider || 'Next Appointment'}</h3>
        <p className="text-muted text-sm">Prepare these questions before your next visit.</p>
      </div>

      {doctorSummary.appointments.length > 0 && (
        <section style={{ marginTop: '1rem' }}>
          <h4>Appointment Set</h4>
          <div className="flex-col" style={{ gap: '0.75rem' }}>
            {doctorSummary.appointments.map((appointment) => (
              <button
                key={appointment.id}
                type="button"
                className={`card ${appointment.id === selectedDoctorAppointmentId ? 'active-session-indicator' : ''}`}
                style={{
                  textAlign: 'left',
                  border: appointment.id === selectedDoctorAppointmentId ? '2px solid var(--primary)' : '1px solid var(--border)',
                  marginBottom: 0,
                }}
                onClick={() => void setSelectedDoctorAppointment(appointment.id)}
              >
                <div className="font-bold">{appointment.provider ?? 'Unscheduled appointment'}</div>
                <div className="text-xs text-muted">
                  {appointment.scheduledAt ? new Date(appointment.scheduledAt).toLocaleString() : 'No date set'}
                </div>
              </button>
            ))}
            <button type="button" className="btn btn-secondary btn-block" onClick={() => void setSelectedDoctorAppointment(null)}>
              Use New Unscheduled Visit
            </button>
          </div>
        </section>
      )}

      <section>
        {doctorSummary.questions.map((item) => (
          <div key={item.id} className="card flex-row space-between" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
            <span className="text-sm">{item.question}</span>
            <button style={{ background: 'none', border: 'none', padding: 0 }} onClick={() => void deleteDoctorQuestion(item.id)}>
              <Trash2 size={18} className="text-danger" style={{ opacity: 0.6 }} />
            </button>
          </div>
        ))}
        {doctorSummary.questions.length === 0 && <p className="text-center text-muted text-sm">No questions listed yet.</p>}
      </section>

      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="form-group">
          <label className="form-label">New Question</label>
          <textarea className="form-control" placeholder="What would you like to ask?" value={question} onChange={(event) => setQuestion(event.target.value)}></textarea>
        </div>
        <button
          className="btn btn-primary btn-block"
          onClick={() => {
            if (question.trim().length === 0) return;
            void addDoctorQuestion(question.trim(), selectedDoctorAppointmentId ?? undefined).then(() => setQuestion(''));
          }}
        >
          <Plus size={20} />
          <span>Add Question</span>
        </button>
      </div>
    </div>
  );
};
