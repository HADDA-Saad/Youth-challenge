import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Tabs from '../components/ui/Tabs';
import LeaderboardRow from '../components/feature/LeaderboardRow';
import { getGlobalLeaderboard, getFriendsLeaderboard } from '../api/leaderboard';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { id: 'global', label: 'Global' },
  { id: 'friends', label: 'Friends' },
  { id: 'challenge', label: 'Challenge Rankings', disabled: true }, // Placeholder for future
];

export default function Leaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('global');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const fetchData = async (tab) => {
    try {
      setLoading(true);
      setError(null);
      let res;
      if (tab === 'global') {
        res = await getGlobalLeaderboard();
      } else if (tab === 'friends') {
        res = await getFriendsLeaderboard();
      }
      
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Leaderboard</h1>
          <p className="text-dark-400">Compete with friends and users around the world.</p>
        </div>

        {/* Tabs */}
        <div className="bg-dark-800/80 backdrop-blur-md border border-dark-700 rounded-xl overflow-hidden shadow-lg">
          <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
          
          <div className="p-6 min-h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : error ? (
              <div className="text-center text-danger-400 p-8 border border-danger-500/20 rounded-xl bg-danger-500/5">
                {error}
              </div>
            ) : data.length === 0 ? (
              <div className="text-center text-dark-400 p-8">
                {activeTab === 'friends' 
                  ? "You don't have any friends yet to compare with." 
                  : "No users found on the leaderboard."}
              </div>
            ) : (
              <div className="space-y-3">
                {data.map((entry) => (
                  <LeaderboardRow 
                    key={entry.userId} 
                    entry={entry} 
                    isCurrentUser={user?.userId === entry.userId} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}
