import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import BadgeCard from '../components/feature/BadgeCard';
import { getUserProfile, getUserBadges, getFriendshipStatus, updateMyProfile } from '../api/users';
import { getAcceptedFriends, getPendingRequests, sendFriendRequest, acceptFriendRequest, declineOrRemoveFriend } from '../api/friends';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  
  // If no userId in URL, we are viewing our own profile
  const isOwnProfile = !userId || parseInt(userId) === currentUser?.userId;
  const targetId = isOwnProfile ? currentUser?.userId : parseInt(userId);

  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', avatarUrl: '', bio: '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  // Social state
  const [friendStatus, setFriendStatus] = useState('NONE'); // NONE, ACCEPTED, PENDING_SENT, PENDING_RECEIVED
  const [friendRequestId, setFriendRequestId] = useState(null);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [socialLoading, setSocialLoading] = useState(false);

  useEffect(() => {
    if (targetId) {
      fetchData();
    }
  }, [targetId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [profileRes, badgesRes] = await Promise.all([
        getUserProfile(targetId),
        getUserBadges(targetId)
      ]);

      if (profileRes.success) setProfile(profileRes.data);
      if (badgesRes.success) setBadges(badgesRes.data);

      if (!isOwnProfile) {
        const statusRes = await getFriendshipStatus(targetId);
        if (statusRes.success) {
          setFriendStatus(statusRes.data.status);
          setFriendRequestId(statusRes.data.requestId);
        }
      } else {
        // Fetch friends list for own profile
        fetchFriends();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      setSocialLoading(true);
      const [friendsRes, pendingRes] = await Promise.all([
        getAcceptedFriends(),
        getPendingRequests()
      ]);
      if (friendsRes.success) setFriends(friendsRes.data);
      if (pendingRes.success) setPendingRequests(pendingRes.data);
    } catch (err) {
      console.error('Failed to load friends', err);
    } finally {
      setSocialLoading(false);
    }
  };

  const handleAddFriend = async () => {
    try {
      await sendFriendRequest(targetId);
      setFriendStatus('PENDING_SENT');
    } catch (err) {
      console.error('Failed to send request', err);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await acceptFriendRequest(requestId);
      if (isOwnProfile) {
        fetchFriends(); // Refresh own profile's friends list
      } else {
        // On a foreign profile, refresh the friendship status button
        const statusRes = await getFriendshipStatus(targetId);
        if (statusRes.success) {
          setFriendStatus(statusRes.data.status);
          setFriendRequestId(statusRes.data.requestId);
        }
      }
    } catch (err) {
      console.error('Failed to accept request', err);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      await declineOrRemoveFriend(requestId);
      fetchFriends(); // Refresh lists
    } catch (err) {
      console.error('Failed to decline request', err);
    }
  };

  const handleRemoveFriend = async () => {
    if (!window.confirm('Are you sure you want to remove this friend?')) return;
    try {
      if (friendRequestId) {
        await declineOrRemoveFriend(friendRequestId);
        setFriendStatus('NONE');
        setFriendRequestId(null);
      } else {
        alert("Cannot remove friend: Request ID missing.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startEditing = () => {
    setFormData({
      username: profile.username || '',
      email: profile.email || '',
      avatarUrl: profile.avatarUrl || '',
      bio: profile.bio || ''
    });
    setPreviewImage(profile.avatarUrl || null);
    setAvatarZoom(1);
    setSaveError(null);
    setSaveSuccess(false);
    setIsEditing(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setAvatarZoom(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedBase64 = async () => {
    if (!previewImage || !previewImage.startsWith('data:')) {
       return formData.avatarUrl;
    }

    const img = new Image();
    img.src = previewImage;
    await new Promise(resolve => img.onload = resolve);
    
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);
    
    const scale = (size / Math.min(img.width, img.height)) * avatarZoom;
    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;
    const x = (size - drawWidth) / 2;
    const y = (size - drawHeight) / 2;
    
    ctx.drawImage(img, x, y, drawWidth, drawHeight);
    return canvas.toDataURL('image/jpeg', 0.85);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      setSaveError("Username cannot be empty");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSaveError("Invalid email address format");
      return;
    }
    // URL validation removed since we are using Base64 Data URLs now

    try {
      setSaveLoading(true);
      setSaveError(null);

      let finalAvatarUrl = formData.avatarUrl;
      if (previewImage && previewImage.startsWith('data:')) {
         finalAvatarUrl = await getCroppedBase64();
      }
      
      const payload = { ...formData, avatarUrl: finalAvatarUrl };
      const updated = await updateMyProfile(payload);
      setProfile(updated.data);
      setSaveSuccess(true);
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess(false);
      }, 1500);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </PageWrapper>
    );
  }

  if (error || !profile) {
    return (
      <PageWrapper>
        <div className="max-w-4xl mx-auto text-center py-20 text-danger-400 p-8 border border-danger-500/20 rounded-xl bg-danger-500/5">
          {error || 'Profile not found'}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        <div className="transition-all duration-200 ease-out">
          {isEditing ? (
            <div>
              {/* Back navigation */}
              <div 
                onClick={() => setIsEditing(false)} 
                className="text-sm text-dark-400 hover:text-primary-400 flex items-center gap-1 cursor-pointer mb-6"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Profile
              </div>

              {/* Two-column layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left column (1/3): Avatar Preview Panel */}
                <div className="md:col-span-1 flex flex-col items-center text-center card bg-dark-800 p-6 rounded-xl border border-dark-700">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 rounded-full border-4 border-dark-800 bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl overflow-hidden mb-4 shrink-0 cursor-pointer relative group"
                  >
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="w-full h-full object-cover transition-transform origin-center"
                        style={{ transform: `scale(${avatarZoom})` }}
                        onError={(e) => { e.target.src = ''; }}
                      />
                    ) : (
                      (formData.username || profile.username || 'U').charAt(0).toUpperCase()
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  {previewImage && previewImage.startsWith('data:') && (
                    <div className="w-full mb-4 px-2">
                      <label className="text-xs text-dark-400 mb-1 flex justify-between">
                        <span>Zoom</span>
                        <span>{Math.round(avatarZoom * 100)}%</span>
                      </label>
                      <input 
                        type="range" 
                        min="1" 
                        max="3" 
                        step="0.05" 
                        value={avatarZoom} 
                        onChange={(e) => setAvatarZoom(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                      />
                    </div>
                  )}

                  <h2 className="text-xl font-bold text-white truncate max-w-full">{profile.username}</h2>
                  <p className="text-xs text-dark-400 mt-2">Click photo to upload new</p>
                </div>

                {/* Right column (2/3): Form Fields */}
                <div className="md:col-span-2 card bg-dark-800 p-6 rounded-xl border border-dark-700">
                  <form onSubmit={handleSave} className="space-y-6">
                    {/* Public Info Group */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-primary-400">Public Info</h3>
                      
                      {/* Username */}
                      <div>
                        <label className="text-sm font-semibold text-dark-300 mb-1.5 block">Username</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark-500">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <input 
                            type="text" 
                            value={formData.username} 
                            onChange={e => setFormData({...formData, username: e.target.value})} 
                            className="bg-dark-900 border border-dark-700 rounded-xl pl-11 pr-4 py-3 text-dark-50 placeholder:text-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition w-full" 
                            required 
                          />
                        </div>
                      </div>

                      {/* Avatar is now uploaded via the panel on the left */}

                      {/* Bio */}
                      <div>
                        <label className="text-sm font-semibold text-dark-300 mb-1.5 block">Bio</label>
                        <div className="relative">
                          <textarea 
                            rows={4}
                            maxLength={160} 
                            value={formData.bio} 
                            onChange={e => setFormData({...formData, bio: e.target.value})} 
                            className="bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-dark-50 placeholder:text-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition w-full resize-none" 
                          />
                          <div className={`text-right text-xs mt-1 ${formData.bio.length > 140 ? 'text-warning-400 font-semibold' : 'text-dark-400'}`}>
                            {formData.bio.length}/160
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Separator */}
                    <div className="border-t border-dark-700 pt-6 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-primary-400">Account</h3>
                      
                      {/* Email */}
                      <div>
                        <label className="text-sm font-semibold text-dark-300 mb-1.5 block">Email</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark-500">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <input 
                            type="email" 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                            className="bg-dark-900 border border-dark-700 rounded-xl pl-11 pr-4 py-3 text-dark-50 placeholder:text-dark-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition w-full" 
                            required 
                          />
                        </div>
                        <p className="text-xs text-dark-500 mt-1">Changing your email will require re-login on next session.</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-dark-700/50">
                      {saveError && <div className="text-sm text-danger-400 mr-auto">{saveError}</div>}
                      {saveSuccess && (
                        <div className="text-sm text-success-400 flex items-center gap-1.5 mr-auto">
                          <svg className="w-5 h-5 text-success-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          Profile updated successfully!
                        </div>
                      )}
                      
                      <button 
                        type="button" 
                        onClick={() => setIsEditing(false)} 
                        className="btn-secondary px-6"
                        disabled={saveLoading}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn-primary px-8 flex items-center justify-center min-w-[100px]" 
                        disabled={saveLoading}
                      >
                        {saveLoading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        ) : (
                          'Save'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Profile Header */}
              <div className="card overflow-hidden !p-0">
                <div className="h-32 bg-gradient-to-r from-primary-600 to-accent-500"></div>
                <div className="px-8 pb-8 relative">
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12 mb-6">
                    <div className="w-24 h-24 rounded-full border-4 border-dark-800 bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl shrink-0 overflow-hidden">
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full object-cover" />
                      ) : (
                        profile.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 pb-1">
                      <h1 className="text-3xl font-bold text-white truncate">{profile.username}</h1>
                      <div className="flex flex-col gap-1 mt-2">
                        {profile.bio && <p className="text-sm text-dark-200">{profile.bio}</p>}
                        <div className="flex items-center gap-3 text-sm text-dark-300">
                          <span className="badge-pill bg-primary-500/20 text-primary-400 border border-primary-500/30">
                            {profile.level}
                          </span>
                          <span className="font-semibold text-accent-400">{profile.xp.toLocaleString()} XP</span>
                          <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pb-1 shrink-0 w-full md:w-auto">
                      {isOwnProfile ? (
                        <button onClick={startEditing} className="btn-secondary w-full md:w-auto">Edit Profile</button>
                      ) : (
                        <>
                          {friendStatus === 'NONE' && (
                            <button onClick={handleAddFriend} className="btn-primary flex items-center gap-2 w-full md:w-auto justify-center">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                              </svg>
                              Add Friend
                            </button>
                          )}
                          {friendStatus === 'PENDING_SENT' && (
                            <button disabled className="btn-secondary opacity-70 w-full md:w-auto">Request Sent</button>
                          )}
                          {friendStatus === 'PENDING_RECEIVED' && (
                            <button onClick={() => handleAcceptRequest(friendRequestId)} className="btn-accent w-full md:w-auto">Accept Request</button>
                          )}
                          {friendStatus === 'ACCEPTED' && (
                            <button onClick={handleRemoveFriend} className="btn-secondary text-danger-400 hover:bg-danger-500/10 border-danger-500/30 w-full md:w-auto">
                              Remove Friend
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-dark-700">
                    <div className="text-center p-4 rounded-xl bg-dark-900/50">
                      <div className="text-2xl font-bold text-white mb-1">{profile.goalsCompleted || 0}</div>
                      <div className="text-xs text-dark-400 uppercase tracking-wider font-semibold">Goals Completed</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-dark-900/50">
                      <div className="text-2xl font-bold text-white mb-1">{profile.challengesCompleted || 0}</div>
                      <div className="text-xs text-dark-400 uppercase tracking-wider font-semibold">Challenges Done</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-dark-900/50">
                      <div className="text-2xl font-bold text-white mb-1">{profile.friendsCount || 0}</div>
                      <div className="text-xs text-dark-400 uppercase tracking-wider font-semibold">Friends</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Badges */}
                <div className="lg:col-span-2 space-y-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Badges ({badges.length})
                  </h2>
                  
                  {badges.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {badges.map((badge, idx) => (
                        <BadgeCard key={idx} badge={badge} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 border border-dark-700 border-dashed rounded-xl text-dark-400">
                      No badges earned yet.
                    </div>
                  )}
                </div>

                {/* Right Column: Friends */}
                {isOwnProfile && (
                  <div className="space-y-6">
                    {/* Pending Requests */}
                    {pendingRequests.length > 0 && (
                      <div className="card border-primary-500/30">
                        <h3 className="text-sm font-bold text-primary-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
                          Pending Requests
                        </h3>
                        <div className="space-y-4">
                          {pendingRequests.map(req => (
                            <div key={req.requestId} className="flex items-center justify-between p-3 rounded-lg bg-dark-900/50">
                              <Link to={`/profile/${req.senderId}`} className="flex items-center gap-3 min-w-0 group">
                                <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                  {req.senderUsername.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-dark-50 truncate group-hover:text-primary-400 transition-colors">
                                  {req.senderUsername}
                                </span>
                              </Link>
                              <div className="flex gap-1 shrink-0">
                                <button 
                                  onClick={() => handleAcceptRequest(req.requestId)}
                                  className="p-1.5 rounded-md bg-success-500/20 text-success-400 hover:bg-success-500/30 transition-colors"
                                  title="Accept"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </button>
                                <button 
                                  onClick={() => handleDeclineRequest(req.requestId)}
                                  className="p-1.5 rounded-md bg-danger-500/20 text-danger-400 hover:bg-danger-500/30 transition-colors"
                                  title="Decline"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Friends List */}
                    <div className="card">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-dark-200 uppercase tracking-wider">
                          Friends
                        </h3>
                        <Link to="/leaderboard" className="text-xs text-primary-400 hover:text-primary-300">
                          View Leaderboard
                        </Link>
                      </div>
                      
                      {socialLoading ? (
                        <div className="flex justify-center p-4"><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-500"></div></div>
                      ) : friends.length > 0 ? (
                        <div className="space-y-3">
                          {friends.map(friend => (
                            <Link key={friend.userId} to={`/profile/${friend.userId}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-700/50 transition-colors group">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                                {friend.username.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-dark-50 truncate group-hover:text-primary-400 transition-colors">
                                  {friend.username}
                                </div>
                                <div className="text-xs text-dark-400 truncate">
                                  {friend.level} • {friend.xp.toLocaleString()} XP
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-6 bg-dark-900/50 rounded-lg border border-dark-700 border-dashed text-sm text-dark-400">
                          You haven't added any friends yet. Check out the Global Leaderboard to find people!
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
