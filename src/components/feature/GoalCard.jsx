import ProgressBar from '../ui/ProgressBar';

const categoryColors = {
  FITNESS: { bg: 'bg-success-500/15', text: 'text-success-400', border: 'border-success-500/30' },
  STUDY: { bg: 'bg-primary-500/15', text: 'text-primary-400', border: 'border-primary-500/30' },
  CREATIVITY: { bg: 'bg-accent-500/15', text: 'text-accent-400', border: 'border-accent-500/30' },
  OTHER: { bg: 'bg-dark-500/15', text: 'text-dark-300', border: 'border-dark-500/30' },
};

export default function GoalCard({ goal, onCheckIn }) {
  const category = categoryColors[goal.category] || categoryColors.OTHER;
  const isCompleted = goal.status === 'COMPLETED';
  const deadlineStr = goal.deadline
    ? new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className={`card group hover:border-dark-600 transition-all duration-200 ${isCompleted ? 'opacity-75' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-dark-50 truncate">{goal.title}</h3>
        </div>
        <span className={`badge-pill ${category.bg} ${category.text} border ${category.border} ml-2 shrink-0`}>
          {goal.category}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <ProgressBar
          value={goal.currentValue}
          max={goal.targetValue}
          color={isCompleted ? 'success' : 'primary'}
        />
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          {/* Streak */}
          <div className="flex items-center gap-1">
            {goal.streakCount >= 3 ? (
              <span className="text-accent-400" title="On fire!">🔥</span>
            ) : (
              <svg className="w-4 h-4 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            )}
            <span className={`${goal.streakCount >= 3 ? 'text-accent-400 font-semibold' : 'text-dark-400'}`}>
              {goal.streakCount} day{goal.streakCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Deadline */}
          {deadlineStr && (
            <div className="flex items-center gap-1 text-dark-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{deadlineStr}</span>
            </div>
          )}
        </div>

        {/* Status or Check-in button */}
        <div>
          {isCompleted ? (
            <span className="badge-pill bg-success-500/15 text-success-400 border border-success-500/30">
              ✓ Completed
            </span>
          ) : (
            <button
              onClick={() => onCheckIn(goal)}
              className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors px-3 py-1 rounded-lg hover:bg-primary-500/10"
            >
              Check in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
