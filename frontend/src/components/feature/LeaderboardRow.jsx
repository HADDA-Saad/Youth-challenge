import { Link } from 'react-router-dom';

export default function LeaderboardRow({ entry, isCurrentUser }) {
  const isTop3 = entry.rank <= 3;
  
  const rankColors = {
    1: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    2: 'bg-gray-400/20 text-gray-400 border-gray-400/30',
    3: 'bg-amber-700/20 text-amber-600 border-amber-700/30',
  };

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
      isCurrentUser 
        ? 'bg-primary-900/20 border-primary-500/30 shadow-[0_0_15px_rgba(92,124,250,0.1)]' 
        : 'bg-dark-800/50 border-dark-700 hover:bg-dark-800'
    }`}>
      
      {/* Rank Badge */}
      <div className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg font-bold border ${
        isTop3 ? rankColors[entry.rank] : 'bg-dark-700/50 text-dark-300 border-dark-600'
      }`}>
        #{entry.rank}
      </div>

      {/* User Info */}
      <Link to={`/profile/${entry.userId}`} className="flex items-center gap-3 flex-1 min-w-0 group">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold shrink-0 shadow-inner">
          {entry.avatarUrl ? (
            <img src={entry.avatarUrl} alt={entry.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            entry.username.charAt(0).toUpperCase()
          )}
        </div>
        <div className="truncate">
          <h4 className={`font-semibold truncate transition-colors ${
            isCurrentUser ? 'text-primary-400' : 'text-dark-50 group-hover:text-primary-400'
          }`}>
            {entry.username} {isCurrentUser && <span className="text-xs text-primary-500/70 ml-1">(You)</span>}
          </h4>
          <span className="badge-pill bg-dark-700/50 text-dark-300 border border-dark-600 mt-1">
            {entry.level}
          </span>
        </div>
      </Link>

      {/* XP */}
      <div className="shrink-0 text-right">
        <div className="text-lg font-bold text-accent-400">{entry.xp.toLocaleString()}</div>
        <div className="text-xs font-medium text-dark-400 uppercase tracking-wider">XP</div>
      </div>
    </div>
  );
}
