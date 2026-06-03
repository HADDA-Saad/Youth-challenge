import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMyChallenges, getGlobalChallenges, createChallenge, joinChallenge, submitToChallenge, leaveChallenge, deleteChallenge } from '../api/challenges';
import { getCommunities } from '../api/communities';
import ChallengeCard from '../components/feature/ChallengeCard';
import Modal from '../components/ui/Modal';
import PageWrapper from '../components/layout/PageWrapper';
import { useAuth } from '../context/AuthContext';

const TYPES = ['FIXED_DURATION', 'MILESTONE', 'COMPETITIVE'];
const TYPE_LABELS = {
  FIXED_DURATION: 'Fixed Duration',
  MILESTONE: 'Milestone',
  COMPETITIVE: 'Competitive',
};

export default function Challenges() {
  const { user: authUser } = useAuth();
  const [myChallenges, setMyChallenges] = useState([]);
  const [globalChallenges, setGlobalChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [communities, setCommunities] = useState([]);
  const [searchParams] = useSearchParams();
  const communityIdParam = searchParams.get('communityId');

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    type: 'FIXED_DURATION',
    startDate: '',
    endDate: '',
    communityId: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Submit modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitChallenge, setSubmitChallenge] = useState(null);
  const [submitForm, setSubmitForm] = useState({ value: '', note: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [myRes, globalRes, commRes] = await Promise.all([
        getMyChallenges(),
        getGlobalChallenges(0, 50),
        getCommunities()
      ]);
      if (myRes.success) setMyChallenges(myRes.data);
      if (globalRes.success) setGlobalChallenges(globalRes.data.content || globalRes.data);
      if (commRes.success) setCommunities(commRes.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);

    try {
      const payload = { ...createForm };
      if (!payload.communityId) delete payload.communityId;

      const response = await createChallenge(payload);
      if (response.success) {
        if (!payload.communityId) {
          setGlobalChallenges((prev) => [response.data, ...prev]);
        }
        setShowCreateModal(false);
        setCreateForm({ title: '', description: '', type: 'FIXED_DURATION', startDate: '', endDate: '', communityId: '' });
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create challenge');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoin = async (challengeId) => {
    try {
      const response = await joinChallenge(challengeId);
      if (response.success) {
        setMyChallenges((prev) => [response.data, ...prev]);
        setGlobalChallenges((prev) => prev.map((c) => (c.id === challengeId ? response.data : c)));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join challenge');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleLeave = async (challengeId) => {
    if (!window.confirm('Are you sure you want to leave this challenge?')) return;
    try {
      const response = await leaveChallenge(challengeId);
      if (response.success) {
        setMyChallenges((prev) => prev.filter((c) => c.id !== challengeId));
        setGlobalChallenges((prev) => prev.map((c) => c.id === challengeId ? { ...c, joined: false, participantCount: c.participantCount - 1 } : c));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave challenge');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (challengeId) => {
    if (!window.confirm('Are you sure you want to delete this challenge?')) return;
    try {
      const response = await deleteChallenge(challengeId);
      if (response.success) {
        setMyChallenges((prev) => prev.filter((c) => c.id !== challengeId));
        setGlobalChallenges((prev) => prev.filter((c) => c.id !== challengeId));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete challenge');
      setTimeout(() => setError(''), 3000);
    }
  };

  const openSubmit = (challenge) => {
    setSubmitChallenge(challenge);
    setSubmitForm({ value: '', note: '' });
    setSubmitError('');
    setShowSubmitModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitLoading(true);

    try {
      const payload = {
        value: parseInt(submitForm.value, 10),
        note: submitForm.note || null,
      };
      const response = await submitToChallenge(submitChallenge.id, payload);
      if (response.success) {
        setMyChallenges((prev) =>
          prev.map((c) => (c.id === submitChallenge.id ? response.data : c))
        );
        setShowSubmitModal(false);
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitLoading(false);
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
            <span>Loading challenges...</span>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-dark-50">Challenges</h1>
            <p className="text-dark-400 mt-1">Join community challenges and compete.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Challenge
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-danger-500/10 border border-danger-500/30 text-danger-400 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {/* My Challenges */}
        <h2 className="text-xl font-bold text-dark-100 mb-4">My Challenges</h2>
        {myChallenges.length === 0 ? (
          <div className="text-center py-8 bg-dark-800 rounded-lg border border-dark-700 mb-8">
            <p className="text-dark-400">You haven't joined any challenges yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 mb-8">
            {myChallenges.map((challenge) => (
              <ChallengeCard
                key={`my-${challenge.id}`}
                challenge={challenge}
                onJoin={handleJoin}
                onSubmit={openSubmit}
                onLeave={handleLeave}
                onDelete={challenge.creatorId === authUser?.userId ? handleDelete : null}
              />
            ))}
          </div>
        )}

        {/* Global Challenges */}
        <h2 className="text-xl font-bold text-dark-100 mb-4 mt-8">Discover Global Challenges</h2>
        {globalChallenges.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-dark-500 mb-4">No global challenges found.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 mb-8">
            {globalChallenges.map((challenge) => (
              <ChallengeCard
                key={`global-${challenge.id}`}
                challenge={challenge}
                onJoin={handleJoin}
                onSubmit={openSubmit}
                onLeave={handleLeave}
                onDelete={challenge.creatorId === authUser?.userId ? handleDelete : null}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Challenge Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create a New Challenge"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {createError && (
            <div className="bg-danger-500/10 border border-danger-500/30 text-danger-400 px-4 py-3 rounded-lg text-sm">
              {createError}
            </div>
          )}

          <div>
            <label htmlFor="challenge-title" className="block text-sm font-medium text-dark-300 mb-1.5">Title</label>
            <input
              id="challenge-title"
              type="text"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="input-field"
              placeholder="e.g. 30-Day Fitness Challenge"
              required
            />
          </div>

          <div>
            <label htmlFor="challenge-description" className="block text-sm font-medium text-dark-300 mb-1.5">Description</label>
            <textarea
              id="challenge-description"
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="input-field resize-none"
              rows={3}
              placeholder="Describe the challenge..."
            />
          </div>

          <div>
            <label htmlFor="challenge-type" className="block text-sm font-medium text-dark-300 mb-1.5">Type</label>
            <select
              id="challenge-type"
              value={createForm.type}
              onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
              className="input-field"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="challenge-start" className="block text-sm font-medium text-dark-300 mb-1.5">Start Date</label>
              <input
                id="challenge-start"
                type="date"
                value={createForm.startDate}
                onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="challenge-end" className="block text-sm font-medium text-dark-300 mb-1.5">End Date</label>
              <input
                id="challenge-end"
                type="date"
                value={createForm.endDate}
                onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="challenge-community" className="block text-sm font-medium text-dark-300 mb-1.5">Community (Optional)</label>
            <select
              id="challenge-community"
              className="input-field"
              value={createForm.communityId}
              onChange={(e) => setCreateForm({ ...createForm, communityId: e.target.value })}
            >
              <option value="">No Community (Global)</option>
              {communities.filter(c => c.creatorId === authUser?.userId).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <p className="text-xs text-dark-400 mt-1">You can only create challenges in communities you own.</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={createLoading} className="btn-primary">
              {createLoading ? 'Creating...' : 'Create Challenge'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Submit Proof Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title={`Submit: ${submitChallenge?.title || ''}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <div className="bg-danger-500/10 border border-danger-500/30 text-danger-400 px-4 py-3 rounded-lg text-sm">
              {submitError}
            </div>
          )}

          <div>
            <label htmlFor="submit-value" className="block text-sm font-medium text-dark-300 mb-1.5">
              Progress Percentage (%)
            </label>
            <input
              id="submit-value"
              type="number"
              min="1"
              max="100"
              value={submitForm.value}
              onChange={(e) => setSubmitForm({ ...submitForm, value: e.target.value })}
              className="input-field"
              placeholder="E.g. 10 for 10% progress"
              required
            />
          </div>

          <div>
            <label htmlFor="submit-note" className="block text-sm font-medium text-dark-300 mb-1.5">
              Note (optional)
            </label>
            <textarea
              id="submit-note"
              value={submitForm.note}
              onChange={(e) => setSubmitForm({ ...submitForm, note: e.target.value })}
              className="input-field resize-none"
              rows={3}
              placeholder="Add context or proof..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowSubmitModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitLoading} className="btn-accent">
              {submitLoading ? 'Submitting...' : 'Check In'}
            </button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
