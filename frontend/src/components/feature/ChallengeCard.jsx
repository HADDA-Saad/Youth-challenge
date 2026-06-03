const typeColors = {
  FIXED_DURATION: { bg: 'bg-primary-500/15', text: 'text-primary-400', border: 'border-primary-500/30', label: 'Fixed' },
  MILESTONE: { bg: 'bg-success-500/15', text: 'text-success-400', border: 'border-success-500/30', label: 'Milestone' },
  COMPETITIVE: { bg: 'bg-accent-500/15', text: 'text-accent-400', border: 'border-accent-500/30', label: 'Competitive' },
};

const statusColors = {
  OPEN: { bg: 'bg-success-500/15', text: 'text-success-400', border: 'border-success-500/30' },
  ACTIVE: { bg: 'bg-accent-500/15', text: 'text-accent-400', border: 'border-accent-500/30' },
  COMPLETED: { bg: 'bg-dark-500/15', text: 'text-dark-400', border: 'border-dark-500/30' },
};

export default function ChallengeCard({ challenge, onJoin, onSubmit, onLeave, onDelete }) {
  const typeStyle = typeColors[challenge.type] || typeColors.FIXED_DURATION;
  const statusStyle = statusColors[challenge.status] || statusColors.OPEN;

  const startStr = new Date(challenge.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = new Date(challenge.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const canJoin = (challenge.status === 'OPEN' || challenge.status === 'ACTIVE') && !challenge.joined;
  const canSubmit = (challenge.status === 'ACTIVE' || challenge.status === 'OPEN') && challenge.joined && (challenge.userProgress || 0) < 100;

  return (
    <div className="card group hover:border-dark-600 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-dark-50 truncate">{challenge.title}</h3>
          {challenge.description && (
            <p className="text-sm text-dark-400 mt-1 line-clamp-2">{challenge.description}</p>
          )}
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(challenge.id)}
            className="text-dark-400 hover:text-danger-400 transition-colors p-1 rounded-md hover:bg-danger-500/10 ml-2 shrink-0"
            title="Delete challenge"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`badge-pill ${typeStyle.bg} ${typeStyle.text} border ${typeStyle.border}`}>
          {typeStyle.label}
        </span>
        <span className={`badge-pill ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
          {challenge.status}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-col text-sm mb-4">
        <div className="flex items-center justify-between text-dark-400">
          <div className="flex items-center gap-3">
            {/* Participant count */}
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{challenge.participantCount} joined</span>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{startStr} – {endStr}</span>
            </div>
          </div>
        </div>

        {/* Submissions */}
        {challenge.joined && (
          <div className="w-full mt-4 bg-dark-700/30 p-3 rounded-lg border border-dark-600/50">
            <div className="flex items-center justify-between text-xs text-dark-300 mb-2">
              <span className="font-medium text-dark-200">Progress</span>
              <span className="font-bold text-accent-400">{Math.min(challenge.userProgress || 0, 100)}%</span>
            </div>
            <div className="h-2 w-full bg-dark-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(var(--accent-500),0.5)]"
                style={{ width: `${Math.min(challenge.userProgress || 0, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-dark-400 mt-2 flex justify-between">
              <span>{challenge.userSubmissionsCount || 0} check-ins</span>
              {challenge.userProgress >= 100 && (
                <span className="text-success-400 font-medium">Completed!</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="flex justify-end">
        {canJoin && (
          <button
            onClick={() => onJoin(challenge.id)}
            className="btn-primary text-sm py-2 px-4"
          >
            Join Challenge
          </button>
        )}
        {canSubmit && (
          <button
            onClick={() => onSubmit(challenge)}
            className="btn-accent text-sm py-2 px-4"
          >
            Check In
          </button>
        )}
        {challenge.joined && challenge.status === 'OPEN' && (
          <div className="flex items-center gap-2">
            <span className="badge-pill bg-primary-500/15 text-primary-400 border border-primary-500/30">
              ✓ Joined
            </span>
            {onLeave && (
              <button
                onClick={() => onLeave(challenge.id)}
                className="text-xs text-danger-400 hover:text-danger-300 transition-colors ml-2"
              >
                Leave
              </button>
            )}
          </div>
        )}
        {challenge.status === 'COMPLETED' && (
          <span className="badge-pill bg-dark-500/15 text-dark-400 border border-dark-500/30">
            Completed
          </span>
        )}
      </div>
    </div>
  );
}
