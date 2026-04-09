import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Plus, Save, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDoctorSummary } from '../../lib/app-hooks';

export const DoctorQuestionsScreen = () => {
  const navigate = useNavigate();
  const {
    doctorSummary,
    selectedDoctorAppointmentId,
    setSelectedDoctorAppointment,
    addDoctorQuestion,
    answerDoctorQuestion,
    deleteDoctorQuestion,
  } = useDoctorSummary();
  const [question, setQuestion] = useState('');
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});

  const orderedQuestions = [...doctorSummary.questions].sort((left, right) => {
    if (Boolean(left.answeredAt) !== Boolean(right.answeredAt)) {
      return left.answeredAt ? 1 : -1;
    }
    return left.createdAt.localeCompare(right.createdAt);
  });

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
        {orderedQuestions.map((item) => {
          const answerDraft = answerDrafts[item.id] ?? item.answerNotes ?? '';

          return (
            <div key={item.id} className="card" style={{ padding: '1rem', marginBottom: '0.75rem' }}>
            <div className="flex-row space-between" style={{ alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <div className="flex-row" style={{ gap: '0.5rem', alignItems: 'center' }}>
                  {item.answeredAt ? <CheckCircle2 size={18} className="text-success" /> : <Circle size={18} className="text-muted" />}
                  <span className="text-sm font-bold">{item.question}</span>
                </div>
                <div className="text-xs text-muted" style={{ marginTop: '0.375rem' }}>
                  {item.answeredAt ? `Answered ${new Date(item.answeredAt).toLocaleString()}` : 'Pending doctor answer'}
                </div>
              </div>
              <button type="button" style={{ background: 'none', border: 'none', padding: 0 }} onClick={() => void deleteDoctorQuestion(item.id)}>
                <Trash2 size={18} className="text-danger" style={{ opacity: 0.6 }} />
              </button>
            </div>

            <div className="flex-row" style={{ gap: '0.5rem', marginTop: '0.875rem' }}>
              <button
                type="button"
                className={`btn ${item.answeredAt ? 'btn-secondary' : 'btn-primary'}`}
                style={{ minHeight: 40 }}
                onClick={() =>
                  void answerDoctorQuestion({
                    questionId: item.id,
                    answered: !item.answeredAt,
                    answerNotes: item.answeredAt ? null : answerDraft.trim() || null,
                  })
                }
              >
                {item.answeredAt ? <Circle size={16} /> : <CheckCircle2 size={16} />}
                <span>{item.answeredAt ? 'Mark Unanswered' : 'Mark Answered'}</span>
              </button>
            </div>

            <div className="form-group" style={{ marginTop: '0.875rem', marginBottom: 0 }}>
              <label className="form-label">Answer Notes</label>
              <textarea
                className="form-control"
                placeholder="Optional answer details from the visit"
                value={answerDraft}
                onChange={(event) =>
                  setAnswerDrafts((previous) => ({
                    ...previous,
                    [item.id]: event.target.value,
                  }))
                }
              />
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: '0.75rem', minHeight: 40 }}
              disabled={!item.answeredAt}
              onClick={() =>
                void answerDoctorQuestion({
                  questionId: item.id,
                  answered: true,
                  answerNotes: answerDraft.trim() || null,
                })
              }
            >
              <Save size={16} />
              <span>Save Answer Notes</span>
            </button>
            </div>
          );
        })}
        {orderedQuestions.length === 0 && <p className="text-center text-muted text-sm">No questions listed yet.</p>}
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
