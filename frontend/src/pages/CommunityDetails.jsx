import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCommunity, addCommunityBadge, getCommunityBadges, getCommunityMembers, updateCommunity, deleteCommunity, assignRole, joinCommunity, leaveCommunity, deleteCommunityBadge } from '../api/communities';
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
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Community Management State
  const [showManageModal, setShowManageModal] = useState(false);
  const [manageForm, setManageForm] = useState({ name: '', profilePictureBase64: '' });
  const [manageLoading, setManageLoading] = useState(false);

  // Badge Modal State
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [badgeForm, setBadgeForm] = useState({ name: '', description: '', requiredLevel: '', requiredXp: '', imageBase64: '' });
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
      const [commRes, badgesRes, challengesRes, membersRes] = await Promise.all([
        getCommunity(id),
        getCommunityBadges(id),
        getChallenges(0, 50, id),
        getCommunityMembers(id).catch(() => ({ success: true, data: [] }))
      ]);
      if (commRes.success) {
        setCommunity(commRes.data);
        setManageForm({ name: commRes.data.name, profilePictureBase64: commRes.data.profilePictureBase64 || '' });
      }
      if (badgesRes.success) setBadges(badgesRes.data);
      if (challengesRes.success) setChallenges(challengesRes.data.content || challengesRes.data);
      if (membersRes.success) setMembers(membersRes.data);
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
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 128; // Badges can be smaller
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round(height *= MAX_SIZE / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round(width *= MAX_SIZE / height);
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        setBadgeForm({ ...badgeForm, imageBase64: canvas.toDataURL('image/png') });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 256;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round(height *= MAX_SIZE / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round(width *= MAX_SIZE / height);
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        setManageForm({ ...manageForm, profilePictureBase64: canvas.toDataURL('image/jpeg', 0.8) });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAddBadge = async (e) => {
    e.preventDefault();
    setBadgeLoading(true);
    try {
      const payload = { ...badgeForm, requiredLevel: parseInt(badgeForm.requiredLevel, 10), requiredXp: 0 };
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

  const handleDeleteBadge = async (badgeId) => {
    if (!window.confirm('Are you sure you want to delete this badge?')) return;
    try {
      const response = await deleteCommunityBadge(id, badgeId);
      if (response.success) {
        setBadges((prev) => prev.filter(b => b.id !== badgeId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete badge');
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

  const handleJoinCommunity = async () => {
    try {
      const response = await joinCommunity(id);
      if (response.success) {
        setCommunity(response.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join community');
    }
  };

  const handleLeaveCommunity = async () => {
    if (!window.confirm('Are you sure you want to leave this community?')) return;
    try {
      const response = await leaveCommunity(id);
      if (response.success) {
        setCommunity(response.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave community');
    }
  };

  const handleUpdateCommunity = async (e) => {
    e.preventDefault();
    setManageLoading(true);
    try {
      const response = await updateCommunity(id, manageForm);
      if (response.success) {
        setCommunity(response.data);
        setShowManageModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update community');
    } finally {
      setManageLoading(false);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!window.confirm('WARNING: Are you sure you want to delete this community completely? This action cannot be undone.')) return;
    try {
      const response = await deleteCommunity(id);
      if (response.success) {
        window.location.href = '/communities';
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete community');
    }
  };

  const handleAssignRole = async (userId, role) => {
    try {
      const response = await assignRole(id, { userId, role });
      if (response.success) {
        setMembers((prev) => prev.map((m) => m.userId === userId ? { ...m, role } : m));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign role');
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

  const isCreator = community.userRole === 'CREATOR';
  const isModerator = isCreator || community.userRole === 'MODERATOR';

  const getNextLevelXp = (level) => {
    if (level === 1) return 500;
    if (level === 2) return 1000;
    if (level === 3) return 2000;
    return 5000;
  };
  const nextLevelXp = community.joined ? getNextLevelXp(community.userLevel) : 500;

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/communities" className="text-sm text-primary-400 hover:text-primary-300 transition-colors mb-4 inline-block">
            ← Back to Communities
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {community.profilePictureBase64 && (
                <img src={community.profilePictureBase64} alt={community.name} className="w-20 h-20 rounded-xl object-cover border-2 border-dark-700" />
              )}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-dark-50">{community.name}</h1>
                  {isCreator && <span className="badge-pill bg-accent-500/20 text-accent-400 border border-accent-500/30">Creator</span>}
                  {community.userRole === 'MODERATOR' && <span className="badge-pill bg-primary-500/20 text-primary-400 border border-primary-500/30">Moderator</span>}
                </div>
                <p className="text-dark-400 mt-2">{community.description}</p>
                <div className="flex items-center gap-4 mt-4">
                  <span className="badge-pill bg-dark-700 text-dark-300 h-fit mt-2">{community.memberCount} members</span>
                  {community.joined && (() => {
                    const earnedBadge = badges.find(b => b.requiredLevel === community.userLevel) || badges.slice().reverse().find(b => b.requiredLevel <= community.userLevel);
                    return (
                      <div className="flex flex-col gap-1.5 min-w-[240px] bg-dark-800/50 p-3 rounded-lg border border-dark-700">
                        <div className="flex justify-between items-center text-xs font-medium">
                          <div className="flex items-center gap-2">
                            {earnedBadge && (
                              <img src={earnedBadge.imageBase64} alt={earnedBadge.name} className="w-5 h-5 object-contain drop-shadow" title={earnedBadge.name} />
                            )}
                            <span className="text-primary-400">Level {community.userLevel}</span>
                          </div>
                          <span className="text-dark-300">{community.userXp} / {nextLevelXp} XP</span>
                        </div>
                      <div className="h-2.5 w-full bg-dark-700 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-primary-500 rounded-full transition-all duration-700 shadow-[0_0_8px_rgba(var(--primary-500),0.6)]"
                          style={{ width: `${Math.min((community.userXp / nextLevelXp) * 100, 100)}%` }}
                        ></div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {!community.joined ? (
                <button onClick={handleJoinCommunity} className="btn-primary">
                  Join Community
                </button>
              ) : (
                <>
                  {!isCreator && (
                    <button onClick={handleLeaveCommunity} className="btn-secondary text-danger-400 hover:text-danger-300 hover:border-danger-400/50">
                      Leave
                    </button>
                  )}
                  {isCreator && (
                    <button onClick={() => setShowManageModal(true)} className="btn-secondary border-accent-500/30 text-accent-400 hover:bg-accent-500/10">
                      Manage
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content: Challenges */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-dark-50">Community Challenges</h2>
              {isModerator && (
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
                    onDelete={isModerator ? handleDeleteChallenge : null}
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
                  <div key={badge.id} className="card p-4 text-center hover:border-dark-600 transition-colors relative group">
                    {isCreator && (
                      <button 
                        onClick={() => handleDeleteBadge(badge.id)} 
                        className="absolute top-2 right-2 text-dark-400 hover:text-danger-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Badge"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                    <img src={badge.imageBase64} alt={badge.name} className="w-16 h-16 mx-auto mb-3 object-contain drop-shadow-lg" />
                    <h4 className="text-sm font-bold text-dark-50 truncate" title={badge.name}>{badge.name}</h4>
                    <p className="text-xs text-dark-400 mt-1">Level {badge.requiredLevel}</p>
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
            <label className="block text-sm font-medium text-dark-300 mb-1.5">Milestone Level (1-5)</label>
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

      {/* Manage Community Modal */}
      <Modal isOpen={showManageModal} onClose={() => setShowManageModal(false)} title="Manage Community">
        <form onSubmit={handleUpdateCommunity} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-dark-50">Community Details</h3>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Community Name</label>
              <input type="text" required className="input-field" value={manageForm.name} onChange={e => setManageForm({...manageForm, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1.5">Profile Picture</label>
              <div className="flex items-center gap-4">
                {manageForm.profilePictureBase64 && (
                  <img src={manageForm.profilePictureBase64} alt="Preview" className="w-16 h-16 rounded-xl object-cover" />
                )}
                <input type="file" accept="image/*" className="block w-full text-sm text-dark-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-dark-700 file:text-dark-100 hover:file:bg-dark-600" onChange={handleProfileImageChange} />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-dark-700">
            <h3 className="text-lg font-semibold text-dark-50">Members & Roles</h3>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
              {members.map(member => (
                <div key={member.userId} className="flex items-center justify-between p-2 rounded-lg bg-dark-800">
                  <span className="text-sm text-dark-50">{member.username}</span>
                  <select
                    value={member.role}
                    onChange={(e) => handleAssignRole(member.userId, e.target.value)}
                    disabled={member.userId === user?.userId}
                    className="bg-dark-700 text-sm border-dark-600 rounded px-2 py-1 outline-none focus:border-primary-500 disabled:opacity-50"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="MODERATOR">Moderator</option>
                    <option value="CREATOR">Creator</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-dark-700">
            <h3 className="text-lg font-semibold text-danger-400 mb-2">Danger Zone</h3>
            <button type="button" onClick={handleDeleteCommunity} className="w-full btn-secondary border-danger-500/30 text-danger-400 hover:bg-danger-500/10">
              Delete Community
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
            <button type="button" onClick={() => setShowManageModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={manageLoading} className="btn-primary">{manageLoading ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
