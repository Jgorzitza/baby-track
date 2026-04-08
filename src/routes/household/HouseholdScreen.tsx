import { Users, UserPlus, LogIn, ChevronRight } from 'lucide-react';

export const HouseholdScreen = () => {
  return (
    <div className="household-screen">
      <div className="card text-center" style={{ padding: '2rem 1.5rem' }}>
        <div className="btn btn-primary btn-icon" style={{ width: 80, height: 80, margin: '0 auto 1.5rem auto' }}>
          <Users size={40} />
        </div>
        <h2>Your Household</h2>
        <p className="text-muted text-sm">Join an existing family or start a new household to share baby data with another parent.</p>
      </div>

      <section>
        <h4>Actions</h4>
        <div className="flex-col" style={{ gap: '1rem' }}>
          <button className="btn btn-primary btn-block">
            <UserPlus size={20} />
            <span>Create New Household</span>
          </button>
          <button className="btn btn-secondary btn-block">
            <LogIn size={20} />
            <span>Join with Invite Code</span>
          </button>
        </div>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h4>Current Members</h4>
        <div className="card">
          <div className="flex-row space-between" style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
            <div className="flex-row">
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>J</div>
              <div>
                <div className="text-sm font-bold">Jane Doe (You)</div>
                <div className="text-xs text-muted">Parent</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </div>
          <div className="flex-row space-between" style={{ paddingTop: '0.75rem' }}>
            <div className="flex-row">
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--secondary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>J</div>
              <div>
                <div className="text-sm font-bold">John Doe</div>
                <div className="text-xs text-muted">Parent</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </div>
        </div>
      </section>
    </div>
  );
};
