import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCommunity, addCommunityBadge, getCommunityBadges } from '../api/communities';
import { getChallenges, createChallenge, deleteChallenge, joinChallenge, submitToChallenge, leaveChallenge } from '../api/challenges';
import { useAuth } from '../context/AuthContext';
import PageWrapper from '../components/layout/PageWrapper';
import ChallengeCard from '../components/feature/ChallengeCard';
import Modal from '../components/ui/Modal';

const TYPES = ['FIXED_DURATION', 'MILESTONE', 'COMPETITIVE'];
const TYPE_LABELS = {
  FIXED_DURATION: 'Fixed Duration',
  MILESTONE: 'Milestone',
  COMPETITIVE: 'Competitive',
};

export default function CommunityDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [community, setCommunity] = useState(null);
  const [badges, setBadges] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Badge Modal State
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [badgeForm, setBadgeForm] = useState({ name: '', description: '', requiredLevel: '', imageBase64: '' });
  const [badgeLoading, setBadgeLoading] = useState(false);

  // Challenge Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '', description: '', type: 'FIXED_DURATION', startDate: '', endDate: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Submit Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitChallenge, setSubmitChallenge] = useState(null);
  const [submitForm, setSubmitForm] = useState({ value: '', note: '' });
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [commRes, badgesRes, challengesRes] = await Promise.all([
        getCommunity(id),
        getCommunityBadges(id),
        getChallenges(0, 50, id)
      ]);
      if (commRes.success) setCommunity(commRes.data);
      if (badgesRes.success) setBadges(badgesRes.data);
      if (challengesRes.success) setChallenges(challengesRes.data);
    } catch (err) {
      setError('Failed to load community details');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setBadgeForm({ ...badgeForm, imageBase64: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleAddBadge = async (e) => {
    e.preventDefault();
    setBadgeLoading(true);
    try {
      const payload = { ...badgeForm, requiredLevel: parseInt(badgeForm.requiredLevel, 10) };
      const res = await addCommunityBadge(id, payload);
      if (res.success) {
        setBadges([...badges, res.data]);
        setShowBadgeModal(false);
        setBadgeForm({ name: '', description: '', requiredLevel: '', imageBase64: '' });
      }
    } catch (err) {
      alert('Failed to add badge');
    } finally {
      setBadgeLoading(false);
    }
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);
    try {
      const payload = { ...createForm, communityId: id };
      const response = await createChallenge(payload);
      if (response.success) {
        setChallenges((prev) => [response.data, ...prev]);
        setShowCreateModal(false);
        setCreateForm({ title: '', description: '', type: 'FIXED_DURATION', startDate: '', endDate: '' });
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create challenge');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (!window.confirm('Are you sure you want to delete this challenge?')) return;
    try {
      const response = await deleteChallenge(challengeId);
      if (response.success) {
        setChallenges((prev) => prev.filter((c) => c.id !== challengeId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete challenge');
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    try {
      const response = await joinChallenge(challengeId);
      if (response.success) {
        setChallenges((prev) => prev.map((c) => (c.id === challengeId ? response.data : c)));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join challenge');
    }
  };

  const handleLeaveChallenge = async (challengeId) => {
    if (!window.confirm('Are you sure you want to leave this challenge?')) return;
    try {
      const response = await leaveChallenge(challengeId);
      if (response.success) {
        setChallenges((prev) => prev.map((c) => c.id === challengeId ? { ...c, joined: false, participantCount: c.participantCount - 1 } : c));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave challenge');
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const payload = { value: parseInt(submitForm.value, 10), note: submitForm.note || null };
      const response = await submitToChallenge(submitChallenge.id, payload);
      if (response.success) {
        setChallenges((prev) => prev.map((c) => (c.id === submitChallenge.id ? response.data : c)));
        setShowSubmitModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center py-32 text-dark-400">Loading community details...</div>
      </PageWrapper>
    );
  }

  if (error || !community) {
    return (
      <PageWrapper>
        <div className="flex justify-center py-32 text-danger-400">{error || 'Community not found'}</div>
      </PageWrapper>
    );
  }

  const isCreator = community.creatorId === user?.userId;

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/communities" className="text-sm text-primary-400 hover:text-primary-300 transition-colors mb-4 inline-block">
            ← Back to Communities
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-dark-50">{community.name}</h1>
              <p className="text-dark-400 mt-2">{community.description}</p>
              <div className="flex items-center gap-4 mt-4">
                <span className="badge-pill bg-dark-700 text-dark-300">{community.memberCount} members</span>
                {community.joined && (
                  <span className="badge-pill bg-primary-500/15 text-primary-400 border border-primary-500/30">
                    Level {community.userLevel} ({community.userXp} XP)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content: Challenges */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-dark-50">Community Challenges</h2>
              {isCreator && (
                <button onClick={() => setShowCreateModal(true)} className="btn-primary text-sm py-1.5 px-3">
                  + New Challenge
                </button>
              )}
            </div>
            
            {challenges.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-dark-400">No challenges in this community yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {challenges.map((challenge) => (
                  <ChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    onJoin={handleJoinChallenge}
                    onSubmit={(c) => { setSubmitChallenge(c); setSubmitForm({ value: '', note: '' }); setShowSubmitModal(true); }}
                    onLeave={handleLeaveChallenge}
                    onDelete={isCreator ? handleDeleteChallenge : null}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar: Badges */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-dark-50">Milestone Badges</h2>
              {isCreator && (
                <button onClick={() => setShowBadgeModal(true)} className="text-sm text-accent-400 hover:text-accent-300">
                  + Add Badge
                </button>
              )}
            </div>
            
            {badges.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-sm text-dark-400">No custom badges added yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge) => (
                  <div key={badge.id} className="card p-4 text-center hover:border-dark-600 transition-colors">
                    <img src={badge.imageBase64} alt={badge.name} className="w-16 h-16 mx-auto mb-3 object-contain" />
                    <h4 className="text-sm font-bold text-dark-50 truncate" title={badge.name}>{badge.name}</h4>
                    <p className="text-xs text-dark-400 mt-1">Unlocks at Level {badge.requiredLevel}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showBadgeModal} onClose={() => setShowBadgeModal(false)} title="Add Milestone Badge">
        <form onSubmit={handleAddBadge} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Badge Name</label>
            <input type="text" required className="input-field" value={badgeForm.name} onChange={e => setBadgeForm({...badgeForm, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Description</label>
            <textarea className="input-field resize-none" rows={2} value={badgeForm.description} onChange={e => setBadgeForm({...badgeForm, description: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Milestone Level (1-5) (5 = 100% achievements)</label>
            <input type="number" min="1" max="5" required className="input-field" value={badgeForm.requiredLevel} onChange={e => setBadgeForm({...badgeForm, requiredLevel: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Badge Image (Small PNG)</label>
            <input type="file" accept="image/png" required className="block w-full text-sm text-dark-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-dark-700 file:text-dark-100 hover:file:bg-dark-600" onChange={handleImageChange} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowBadgeModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={badgeLoading} className="btn-accent">{badgeLoading ? 'Adding...' : 'Add Badge'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Community Challenge">
        <form onSubmit={handleCreateChallenge} className="space-y-4">
          {createError && <div className="text-danger-400 text-sm">{createError}</div>}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Title</label>
            <input type="text" required className="input-field" value={createForm.title} onChange={e => setCreateForm({...createForm, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Description</label>
            <textarea className="input-field resize-none" rows={3} value={createForm.description} onChange={e => setCreateForm({...createForm, description: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Type</label>
            <select className="input-field" value={createForm.type} onChange={e => setCreateForm({...createForm, type: e.target.value})}>
              {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Start Date</label>
              <input type="date" required className="input-field" value={createForm.startDate} onChange={e => setCreateForm({...createForm, startDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">End Date</label>
              <input type="date" required className="input-field" value={createForm.endDate} onChange={e => setCreateForm({...createForm, endDate: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={createLoading} className="btn-primary">{createLoading ? 'Creating...' : 'Create Challenge'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} title={`Check In to ${submitChallenge?.title}`}>
        <form onSubmit={handleSubmitProof} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Today&apos;s value</label>
            <input type="number" min="1" required className="input-field" value={submitForm.value} onChange={e => setSubmitForm({...submitForm, value: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Note</label>
            <textarea className="input-field resize-none" rows={3} value={submitForm.note} onChange={e => setSubmitForm({...submitForm, note: e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowSubmitModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitLoading} className="btn-accent">{submitLoading ? 'Saving...' : 'Check In'}</button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
