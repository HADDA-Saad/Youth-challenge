import { useState, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import Tabs from '../components/ui/Tabs';
import LeaderboardRow from '../components/feature/LeaderboardRow';
import { getGlobalLeaderboard, getFriendsLeaderboard, getChallengeLeaderboard } from '../api/leaderboard';
import { getMyChallenges } from '../api/challenges';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { id: 'global', label: 'Global' },
  { id: 'friends', label: 'Friends' },
  { id: 'challenge', label: 'Challenge Rankings' },
];

export default function Leaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('global');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Challenge tab state
  const [myChallenges, setMyChallenges] = useState([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState('');
  const [challengesLoading, setChallengesLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'challenge') {
      fetchMyChallenges();
      setData([]);
      setLoading(false);
    } else {
      fetchData(activeTab);
    }
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

  const fetchMyChallenges = async () => {
    try {
      setChallengesLoading(true);
      const res = await getMyChallenges();
      if (res.success) {
        setMyChallenges(res.data || []);
      }
    } catch (err) {
      // Silently handle
    } finally {
      setChallengesLoading(false);
    }
  };

  const handleChallengeSelect = async (e) => {
    const challengeId = e.target.value;
    setSelectedChallengeId(challengeId);

    if (!challengeId) {
      setData([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await getChallengeLeaderboard(challengeId);
      if (res.success) {
        setData(res.data || []);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch challenge leaderboard');
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
            {/* Challenge selector dropdown */}
            {activeTab === 'challenge' && (
              <div className="mb-6">
                <select
                  value={selectedChallengeId}
                  onChange={handleChallengeSelect}
                  className="input-field w-full"
                  disabled={challengesLoading}
                >
                  <option value="">Select a challenge…</option>
                  {myChallenges.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : error ? (
              <div className="text-center text-danger-400 p-8 border border-danger-500/20 rounded-xl bg-danger-500/5">
                {error}
              </div>
            ) : activeTab === 'challenge' && !selectedChallengeId ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <svg className="w-12 h-12 text-dark-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.853m0 0c-.94.08-1.892.08-2.832.001" />
                </svg>
                <p className="text-dark-400">Select a challenge above to see its live ranking</p>
              </div>
            ) : data.length === 0 ? (
              <div className="text-center text-dark-400 p-8">
                {activeTab === 'friends' 
                  ? "You don't have any friends yet to compare with." 
                  : activeTab === 'challenge'
                  ? "No rankings available for this challenge yet."
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
