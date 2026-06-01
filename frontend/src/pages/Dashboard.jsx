import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyProfile, getMyBadges } from '../api/users';
import { getGoals } from '../api/goals';
import { getChallenges } from '../api/challenges';
import { getLevelInfo } from '../utils/xpUtils';
import ProgressBar from '../components/ui/ProgressBar';
import GoalCard from '../components/feature/GoalCard';
import ChallengeCard from '../components/feature/ChallengeCard';
import BadgeCard from '../components/feature/BadgeCard';
import PageWrapper from '../components/layout/PageWrapper';
import Modal from '../components/ui/Modal';
import { checkIn as checkInApi, deleteGoal } from '../api/goals';
import { joinChallenge, submitToChallenge, leaveChallenge } from '../api/challenges';

export default function Dashboard() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [goals, setGoals] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInGoal, setCheckInGoal] = useState(null);
  const [checkInForm, setCheckInForm] = useState({ value: '', note: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const [showSubmit, setShowSubmit] = useState(false);
  const [submitChallenge, setSubmitChallenge] = useState(null);
  const [submitForm, setSubmitForm] = useState({ value: '', note: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [profileRes, badgesRes, goalsRes, challengesRes] = await Promise.allSettled([
        getMyProfile(),
        getMyBadges(),
        getGoals(),
        getChallenges(0, 3),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value.success) {
        setProfile(profileRes.value.data);
      }
      if (badgesRes.status === 'fulfilled' && badgesRes.value.success) {
        setBadges(badgesRes.value.data);
      }
      if (goalsRes.status === 'fulfilled' && goalsRes.value.success) {
        setGoals(goalsRes.value.data);
      }
      if (challengesRes.status === 'fulfilled' && challengesRes.value.success) {
        setChallenges(challengesRes.value.data);
      }
    } catch {
      // Individual failures handled above via allSettled
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (challengeId) => {
    try {
      const res = await joinChallenge(challengeId);
      if (res.success) {
        setChallenges(prev => prev.map(c => c.id === challengeId ? res.data : c));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join challenge');
    }
  };

  const handleLeave = async (challengeId) => {
    if (!window.confirm('Are you sure you want to leave this challenge?')) return;
    try {
      await leaveChallenge(challengeId);
      fetchDashboardData(); // Refresh to update joined status and XP
    } catch (err) {
      alert('Failed to leave challenge');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await deleteGoal(goalId);
      setGoals(prev => prev.filter(g => g.id !== goalId));
    } catch (err) {
      alert('Failed to delete goal');
    }
  };

  const submitCheckIn = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = { value: parseInt(checkInForm.value, 10), note: checkInForm.note || null };
      const res = await checkInApi(checkInGoal.id, payload);
      if (res.success) {
        fetchDashboardData(); // refresh XP, Badges, etc.
        setShowCheckIn(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const submitProof = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const payload = { value: parseInt(submitForm.value, 10), note: submitForm.note || null };
      const res = await submitToChallenge(submitChallenge.id, payload);
      if (res.success) {
        fetchDashboardData();
        setShowSubmit(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Submit failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-32">
          <div className="flex items-center gap-3 text-dark-400">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Loading dashboard...</span>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const levelInfo = profile ? getLevelInfo(profile.xp) : null;
  const activeGoals = goals.filter((g) => g.status === 'ACTIVE').slice(0, 3);
  const recentBadges = badges.slice(0, 3);

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto">
        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-dark-50">
            Welcome back, {profile?.username || authUser?.username || 'User'}! 👋
          </h1>
          <p className="text-dark-400 mt-1">Here&apos;s your progress overview.</p>
        </div>

        {/* XP & Level Card */}
        {levelInfo && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xl font-bold">
                  {profile.username?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-dark-50">{levelInfo.level}</h2>
                  <p className="text-sm text-dark-400">
                    {levelInfo.currentXp} XP total
                    {levelInfo.nextLevel && ` · ${levelInfo.xpForNextLevel - levelInfo.xpInLevel} XP to ${levelInfo.nextLevel}`}
                  </p>
                </div>
              </div>
              <div className="badge-pill bg-primary-500/15 text-primary-400 border border-primary-500/30 text-sm">
                Level: {levelInfo.level}
              </div>
            </div>

            {levelInfo.nextLevel ? (
              <ProgressBar
                value={levelInfo.xpInLevel}
                max={levelInfo.xpForNextLevel}
                color="primary"
                size="lg"
              />
            ) : (
              <div className="text-center py-2">
                <span className="badge-pill bg-accent-500/15 text-accent-400 border border-accent-500/30">
                  🏆 Max Level Reached!
                </span>
              </div>
            )}
          </div>
        )}

        {/* Grid: Badges + Quick Stats */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Recent Badges */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-dark-50">Recent Badges</h2>
            </div>
            {recentBadges.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-dark-500 text-sm">No badges earned yet. Keep going!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBadges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div>
            <h2 className="text-lg font-semibold text-dark-50 mb-4">Quick Stats</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="card text-center">
                <p className="text-2xl font-bold text-primary-400">{profile?.xp || 0}</p>
                <p className="text-xs text-dark-400 mt-1">Total XP</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-accent-400">{badges.length}</p>
                <p className="text-xs text-dark-400 mt-1">Badges Earned</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-success-400">{goals.filter((g) => g.status === 'COMPLETED').length}</p>
                <p className="text-xs text-dark-400 mt-1">Goals Done</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-danger-400">{goals.filter((g) => g.status === 'ACTIVE').length}</p>
                <p className="text-xs text-dark-400 mt-1">Active Goals</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Goals */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-dark-50">Active Goals</h2>
            <Link to="/goals" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
              View all →
            </Link>
          </div>
          {activeGoals.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-dark-500 text-sm mb-3">No active goals yet.</p>
              <Link to="/goals" className="btn-primary text-sm">
                Create a goal
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeGoals.map((goal) => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal} 
                  onCheckIn={(g) => {
                    setCheckInGoal(g);
                    setCheckInForm({ value: '', note: '' });
                    setShowCheckIn(true);
                  }}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </div>
          )}
        </div>

        {/* Active Challenges */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-dark-50">Challenges</h2>
            <Link to="/challenges" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
              View all →
            </Link>
          </div>
          {challenges.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-dark-500 text-sm mb-3">No challenges available yet.</p>
              <Link to="/challenges" className="btn-primary text-sm">
                Browse challenges
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {challenges.map((challenge) => (
                <ChallengeCard 
                  key={challenge.id} 
                  challenge={challenge} 
                  onJoin={handleJoin} 
                  onSubmit={(c) => {
                    setSubmitChallenge(c);
                    setSubmitForm({ value: '', note: '' });
                    setShowSubmit(true);
                  }} 
                  onLeave={handleLeave}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Check-in Modal */}
      <Modal isOpen={showCheckIn} onClose={() => setShowCheckIn(false)} title={`Check-in: ${checkInGoal?.title}`}>
        <form onSubmit={submitCheckIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Today&apos;s value</label>
            <input
              type="number" min="1" required className="input-field"
              value={checkInForm.value} onChange={e => setCheckInForm({...checkInForm, value: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Note</label>
            <textarea
              className="input-field resize-none" rows={3}
              value={checkInForm.note} onChange={e => setCheckInForm({...checkInForm, note: e.target.value})}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCheckIn(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={actionLoading} className="btn-primary">
              {actionLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Check In Modal */}
      <Modal isOpen={showSubmit} onClose={() => setShowSubmit(false)} title={`Check In to ${submitChallenge?.title}`}>
        <form onSubmit={submitProof} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Today&apos;s value</label>
            <input
              type="number" min="1" required className="input-field"
              value={submitForm.value} onChange={e => setSubmitForm({...submitForm, value: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Proof/Note</label>
            <textarea
              className="input-field resize-none" rows={3}
              value={submitForm.note} onChange={e => setSubmitForm({...submitForm, note: e.target.value})}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowSubmit(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={actionLoading} className="btn-accent">
              {actionLoading ? 'Saving...' : 'Check In'}
            </button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
