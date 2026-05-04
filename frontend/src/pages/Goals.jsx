import { useState, useEffect } from 'react';
import { getGoals, createGoal, checkIn as checkInApi, deleteGoal } from '../api/goals';
import GoalCard from '../components/feature/GoalCard';
import Modal from '../components/ui/Modal';
import PageWrapper from '../components/layout/PageWrapper';

const CATEGORIES = ['FITNESS', 'STUDY', 'CREATIVITY', 'OTHER'];
const VISIBILITIES = ['PUBLIC', 'PRIVATE'];

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create goal modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    category: 'FITNESS',
    targetValue: '',
    deadline: '',
    visibility: 'PUBLIC',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // Check-in modal
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInGoal, setCheckInGoal] = useState(null);
  const [checkInForm, setCheckInForm] = useState({ value: '', note: '' });
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInError, setCheckInError] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await getGoals();
      if (response.success) {
        setGoals(response.data);
      }
    } catch (err) {
      setError('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);

    try {
      const payload = {
        ...createForm,
        targetValue: parseInt(createForm.targetValue, 10),
        deadline: createForm.deadline || null,
      };
      const response = await createGoal(payload);
      if (response.success) {
        setGoals((prev) => [response.data, ...prev]);
        setShowCreateModal(false);
        setCreateForm({ title: '', category: 'FITNESS', targetValue: '', deadline: '', visibility: 'PUBLIC' });
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create goal');
    } finally {
      setCreateLoading(false);
    }
  };

  const openCheckIn = (goal) => {
    setCheckInGoal(goal);
    setCheckInForm({ value: '', note: '' });
    setCheckInError('');
    setShowCheckInModal(true);
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setCheckInError('');
    setCheckInLoading(true);

    try {
      const payload = {
        value: parseInt(checkInForm.value, 10),
        note: checkInForm.note || null,
      };
      const response = await checkInApi(checkInGoal.id, payload);
      if (response.success) {
        // Update the goal in the list without reloading
        setGoals((prev) =>
          prev.map((g) => (g.id === checkInGoal.id ? response.data : g))
        );
        setShowCheckInModal(false);
      }
    } catch (err) {
      setCheckInError(err.response?.data?.message || 'Failed to check in');
    } finally {
      setCheckInLoading(false);
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

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-32">
          <div className="flex items-center gap-3 text-dark-400">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Loading goals...</span>
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
            <h1 className="text-2xl font-bold text-dark-50">My Goals</h1>
            <p className="text-dark-400 mt-1">Track your habits and reach your targets.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Goal
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-danger-500/10 border border-danger-500/30 text-danger-400 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {/* Goals grid */}
        {goals.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-dark-800 border border-dark-700 mb-4">
              <svg className="w-10 h-10 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-dark-300 mb-2">No goals yet</h3>
            <p className="text-dark-500 mb-4">Start by creating your first goal.</p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              Create your first goal
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onCheckIn={openCheckIn} onDelete={handleDeleteGoal} />
            ))}
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create a New Goal"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          {createError && (
            <div className="bg-danger-500/10 border border-danger-500/30 text-danger-400 px-4 py-3 rounded-lg text-sm">
              {createError}
            </div>
          )}

          <div>
            <label htmlFor="goal-title" className="block text-sm font-medium text-dark-300 mb-1.5">Title</label>
            <input
              id="goal-title"
              type="text"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="input-field"
              placeholder="e.g. Run 100km this month"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="goal-category" className="block text-sm font-medium text-dark-300 mb-1.5">Category</label>
              <select
                id="goal-category"
                value={createForm.category}
                onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                className="input-field"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="goal-target" className="block text-sm font-medium text-dark-300 mb-1.5">Target Value</label>
              <input
                id="goal-target"
                type="number"
                min="1"
                value={createForm.targetValue}
                onChange={(e) => setCreateForm({ ...createForm, targetValue: e.target.value })}
                className="input-field"
                placeholder="100"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="goal-deadline" className="block text-sm font-medium text-dark-300 mb-1.5">Deadline (optional)</label>
              <input
                id="goal-deadline"
                type="date"
                value={createForm.deadline}
                onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="goal-visibility" className="block text-sm font-medium text-dark-300 mb-1.5">Visibility</label>
              <select
                id="goal-visibility"
                value={createForm.visibility}
                onChange={(e) => setCreateForm({ ...createForm, visibility: e.target.value })}
                className="input-field"
              >
                {VISIBILITIES.map((v) => (
                  <option key={v} value={v}>{v.charAt(0) + v.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="btn-primary"
            >
              {createLoading ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Check-in Modal */}
      <Modal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        title={`Check in: ${checkInGoal?.title || ''}`}
      >
        <form onSubmit={handleCheckIn} className="space-y-4">
          {checkInError && (
            <div className="bg-danger-500/10 border border-danger-500/30 text-danger-400 px-4 py-3 rounded-lg text-sm">
              {checkInError}
            </div>
          )}

          <div>
            <label htmlFor="checkin-value" className="block text-sm font-medium text-dark-300 mb-1.5">
              Today&apos;s progress
            </label>
            <input
              id="checkin-value"
              type="number"
              min="1"
              value={checkInForm.value}
              onChange={(e) => setCheckInForm({ ...checkInForm, value: e.target.value })}
              className="input-field"
              placeholder="How much did you do today?"
              required
            />
            {checkInGoal && (
              <p className="text-xs text-dark-500 mt-1">
                Current: {checkInGoal.currentValue} / {checkInGoal.targetValue}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="checkin-note" className="block text-sm font-medium text-dark-300 mb-1.5">
              Note (optional)
            </label>
            <textarea
              id="checkin-note"
              value={checkInForm.note}
              onChange={(e) => setCheckInForm({ ...checkInForm, note: e.target.value })}
              className="input-field resize-none"
              rows={3}
              placeholder="How did it go?"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCheckInModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={checkInLoading}
              className="btn-accent"
            >
              {checkInLoading ? 'Saving...' : 'Log Progress'}
            </button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
