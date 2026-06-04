import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import { getFeedItems } from '../api/feed';
import { formatRelative } from '../utils/formatDate';

export default function Feed() {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeed(0);
  }, []);

  const fetchFeed = async (pageNumber) => {
    if (pageNumber === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await getFeedItems(pageNumber, 20);
      if (res.success) {
        if (pageNumber === 0) {
          setFeedItems(res.data.data || []);
        } else {
          setFeedItems((prev) => [...prev, ...(res.data.data || [])]);
        }
        setPage(res.data.page);
        setLast(res.data.last);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Failed to load feed.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!last) {
      fetchFeed(page + 1);
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'GOAL_COMPLETED': return 'border-l-primary-500';
      case 'BADGE_EARNED': return 'border-l-accent-500';
      case 'CHALLENGE_COMPLETED': return 'border-l-success-500';
      case 'CHALLENGE_JOINED': return 'border-l-success-500';
      case 'CHECK_IN': return 'border-l-dark-600';
      default: return 'border-l-dark-700';
    }
  };

  const renderEventSentence = (item) => {
    const actorLink = <Link to={`/profile/${item.actorId}`} className="font-bold text-dark-50 hover:underline">{item.actorUsername}</Link>;
    
    switch (item.type) {
      case 'GOAL_COMPLETED':
        return <span>{actorLink} completed the goal <strong className="text-primary-400">{item.targetTitle}</strong> (+100 XP)</span>;
      case 'BADGE_EARNED':
        return <span>{actorLink} earned the badge <strong className="text-accent-400">{item.targetTitle}</strong></span>;
      case 'CHALLENGE_COMPLETED':
        return <span>{actorLink} finished the challenge <strong className="text-success-400">{item.targetTitle}</strong> (+{item.xpEarned} XP)</span>;
      case 'CHALLENGE_JOINED':
        return <span>{actorLink} joined the challenge <strong className="text-success-400">{item.targetTitle}</strong></span>;
      case 'CHECK_IN':
        return <span>{actorLink} checked in on <strong className="text-dark-200">{item.targetTitle}</strong></span>;
      default:
        return <span>{actorLink} did something</span>;
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Activity Feed</h1>
          <p className="text-dark-400">See what your friends are up to.</p>
        </div>

        {error && <div className="text-danger-400">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
        ) : feedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-dark-600 rounded-2xl bg-dark-800/40 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-dark-700/60 flex items-center justify-center">
              <svg className="w-8 h-8 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-dark-200 mb-1">No activity yet</h2>
              <p className="text-sm text-dark-500 max-w-xs mb-3">
                Add friends to see their activity here
              </p>
              <Link to="/profile" className="text-primary-400 text-sm hover:underline font-medium">Find friends</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {feedItems.map((item) => (
              <div key={item.id} className={`card border-l-4 ${getBorderColor(item.type)} py-4`}>
                <div className="flex items-start gap-4">
                  <Link to={`/profile/${item.actorId}`} className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold shadow-md">
                      {item.actorUsername.charAt(0).toUpperCase()}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-dark-100 leading-snug">
                      {renderEventSentence(item)}
                    </p>
                    <p className="text-xs text-dark-400 mt-1.5">
                      {formatRelative(item.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {!last && (
              <div className="pt-4 flex justify-center">
                <button 
                  onClick={handleLoadMore} 
                  disabled={loadingMore}
                  className="btn-secondary w-full py-2 flex justify-center items-center"
                >
                  {loadingMore ? (
                    <div className="w-5 h-5 border-2 border-dark-400 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Load more'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
