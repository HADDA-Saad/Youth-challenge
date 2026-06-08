import { useState, useEffect } from 'react';
import { getCommunities, createCommunity, joinCommunity, leaveCommunity, searchCommunities } from '../api/communities';
import { useAuth } from '../context/AuthContext';
import PageWrapper from '../components/layout/PageWrapper';
import Modal from '../components/ui/Modal';
import { Link } from 'react-router-dom';

export default function Communities() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [createLoading, setCreateLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        performSearch(searchQuery);
      } else {
        fetchCommunities();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const res = await getCommunities();
      if (res.success) {
        setCommunities(res.data);
      }
    } catch (err) {
      setError('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (query) => {
    try {
      setLoading(true);
      const res = await searchCommunities(query);
      if (res.success) {
        setCommunities(res.data);
      }
    } catch (err) {
      setError('Failed to search communities');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const res = await createCommunity(createForm);
      if (res.success) {
        setCommunities([...communities, res.data]);
        setShowCreateModal(false);
        setCreateForm({ name: '', description: '' });
      }
    } catch (err) {
      alert('Failed to create community');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoin = async (id) => {
    try {
      const res = await joinCommunity(id);
      if (res.success) {
        setCommunities(communities.map(c => c.id === id ? res.data : c));
      }
    } catch (err) {
      alert('Failed to join');
    }
  };

  const handleLeave = async (id) => {
    if (!window.confirm('Are you sure you want to leave?')) return;
    try {
      const res = await leaveCommunity(id);
      if (res.success) {
        setCommunities(communities.map(c => c.id === id ? { ...res.data, joined: false } : c));
      }
    } catch (err) {
      alert('Failed to leave');
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center py-32 text-dark-400">Loading communities...</div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-dark-50">Communities</h1>
            <p className="text-dark-400 mt-1">Join communities, climb local leaderboards, and earn custom badges.</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-dark-950/40 border border-dark-700/80 hover:border-dark-600/60 focus:border-primary-500 rounded-xl pl-10 pr-4 py-2 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all duration-300 w-full md:w-64"
              />
            </div>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary py-2 text-sm shrink-0">
              Create Community
            </button>
          </div>
        </div>

        {error && <div className="text-danger-400 mb-4">{error}</div>}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {communities.map(community => (
            <div key={community.id} className="card flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    {community.profilePictureBase64 ? (
                      <img src={community.profilePictureBase64} alt={community.name} className="w-12 h-12 rounded-lg object-cover border border-dark-600" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-dark-700 flex items-center justify-center text-dark-400 font-bold border border-dark-600">
                        {community.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <Link to={`/communities/${community.id}`} className="hover:text-primary-400 transition-colors">
                      <h3 className="text-lg font-bold text-dark-50 hover:underline">{community.name}</h3>
                    </Link>
                  </div>
                  <span className="badge-pill bg-dark-700 text-dark-300 shrink-0">{community.memberCount} members</span>
                </div>
                <p className="text-sm text-dark-400 line-clamp-2 mb-4">{community.description}</p>
              </div>
              
              <div className="flex items-center justify-between border-t border-dark-700 pt-3">
                {community.joined ? (
                  <div className="flex gap-2 w-full justify-between items-center">
                    <span className="text-sm font-semibold text-primary-400">Level {community.userLevel} ({community.userXp} XP)</span>
                    <button onClick={() => handleLeave(community.id)} className="text-xs text-danger-400 hover:underline">Leave</button>
                  </div>
                ) : (
                  <button onClick={() => handleJoin(community.id)} className="btn-secondary w-full py-1.5 text-sm">Join Community</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Community">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Name</label>
            <input type="text" required className="input-field" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Description</label>
            <textarea className="input-field resize-none" rows={3} value={createForm.description} onChange={e => setCreateForm({...createForm, description: e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={createLoading} className="btn-primary">{createLoading ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </Modal>

    </PageWrapper>
  );
}
