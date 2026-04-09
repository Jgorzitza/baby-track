import { useState } from 'react';
import { Users, UserPlus, LogIn, ChevronRight } from 'lucide-react';
import { useAppContext } from '../../lib/app-hooks';

export const HouseholdScreen = () => {
  const { createHousehold, joinHousehold, members, profile, household, actionError, isRefreshing } = useAppContext();
  const [householdName, setHouseholdName] = useState(household?.name ?? '');
  const [inviteCode, setInviteCode] = useState('');

  return (
    <div className="household-screen">
      <div className="card text-center" style={{ padding: '2rem 1.5rem' }}>
        <div className="btn btn-primary btn-icon" style={{ width: 80, height: 80, margin: '0 auto 1.5rem auto' }}>
          <Users size={40} />
        </div>
        <h2>Your Household</h2>
        <p className="text-muted text-sm">Create the shared household or join the existing one with an invite code.</p>
      </div>

      {actionError && (
        <div className="card" style={{ background: 'rgba(255, 107, 107, 0.08)' }}>
          <p className="text-sm" style={{ margin: 0, color: 'var(--danger)' }}>
            {actionError}
          </p>
        </div>
      )}

      <section>
        <h4>Create Household</h4>
        <div className="card">
          <div className="form-group">
            <label className="form-label">Household Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Leo's Family"
              value={householdName}
              onChange={(event) => setHouseholdName(event.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={isRefreshing || householdName.trim().length === 0} onClick={() => void createHousehold(householdName.trim())}>
            <UserPlus size={20} />
            <span>Create New Household</span>
          </button>
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h4>Join Household</h4>
        <div className="card">
          <div className="form-group">
            <label className="form-label">Invite Code</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter 8-character code"
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
            />
          </div>
          <button className="btn btn-secondary btn-block" disabled={isRefreshing || inviteCode.trim().length === 0} onClick={() => void joinHousehold(inviteCode.trim())}>
            <LogIn size={20} />
            <span>Join with Invite Code</span>
          </button>
        </div>
      </section>

      {household && (
        <section style={{ marginTop: '2rem' }}>
          <h4>Current Members</h4>
          <div className="card">
            {members.map((member, index) => {
              const isCurrentUser = member.profileId === profile?.id;
              const label = isCurrentUser ? `${profile?.email ?? 'You'} (You)` : 'Parent';
              return (
                <div
                  key={member.id}
                  className="flex-row space-between"
                  style={{
                    paddingTop: index === 0 ? 0 : '0.75rem',
                    paddingBottom: index === members.length - 1 ? 0 : '0.75rem',
                    borderBottom: index === members.length - 1 ? 'none' : '1px solid var(--border)',
                  }}
                >
                  <div className="flex-row">
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: isCurrentUser ? 'var(--primary)' : 'var(--secondary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                      }}
                    >
                      {label[0]?.toUpperCase() ?? 'P'}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{label}</div>
                      <div className="text-xs text-muted">Parent</div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-muted" />
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
