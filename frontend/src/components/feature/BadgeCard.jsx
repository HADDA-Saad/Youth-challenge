const badgeStyles = {
  FIRST_STEP: { bg: 'bg-primary-500/15', text: 'text-primary-400', border: 'border-primary-500/30', emoji: '👣' },
  ON_FIRE: { bg: 'bg-accent-500/15', text: 'text-accent-400', border: 'border-accent-500/30', emoji: '🔥' },
  BOOKWORM: { bg: 'bg-primary-500/15', text: 'text-primary-400', border: 'border-primary-500/30', emoji: '📚' },
  WINNER: { bg: 'bg-accent-500/15', text: 'text-accent-400', border: 'border-accent-500/30', emoji: '🏆' },
  UNSTOPPABLE: { bg: 'bg-danger-500/15', text: 'text-danger-400', border: 'border-danger-500/30', emoji: '💪' },
  SOCIAL_BUTTERFLY: { bg: 'bg-success-500/15', text: 'text-success-400', border: 'border-success-500/30', emoji: '🦋' },
};

export default function BadgeCard({ badge }) {
  const style = badgeStyles[badge.key] || badgeStyles.FIRST_STEP;

  return (
    <div className={`card ${style.bg} border ${style.border} hover:border-opacity-60 transition-all duration-200`}>
      <div className="flex items-center gap-3">
        {badge.imageBase64 ? (
          <img src={badge.imageBase64} alt={badge.name} className="w-8 h-8 object-contain drop-shadow" title={badge.name} />
        ) : (
          <div className="text-2xl">{style.emoji}</div>
        )}
        <div className="min-w-0">
          <h4 className={`text-sm font-semibold ${style.text} truncate`}>{badge.name}</h4>
          <p className="text-xs text-dark-400 truncate">{badge.description}</p>
        </div>
      </div>
    </div>
  );
}
