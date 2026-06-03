import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import BadgeCard from '../components/feature/BadgeCard';
import { getUserProfile, getUserBadges, getFriendshipStatus } from '../api/users';
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
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="card overflow-hidden !p-0">
          <div className="h-32 bg-gradient-to-r from-primary-600 to-accent-500"></div>
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-12 mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-dark-800 bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl shrink-0">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  profile.username.charAt(0).toUpperCase()
                )}
              </div>
              
              <div className="flex-1 min-w-0 pb-1">
                <h1 className="text-3xl font-bold text-white truncate">{profile.username}</h1>
                <div className="flex items-center gap-3 mt-2 text-sm text-dark-300">
                  <span className="badge-pill bg-primary-500/20 text-primary-400 border border-primary-500/30">
                    {profile.level}
                  </span>
                  <span className="font-semibold text-accent-400">{profile.xp.toLocaleString()} XP</span>
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex gap-3 pb-1 shrink-0 w-full md:w-auto">
                {isOwnProfile ? (
                  <button className="btn-secondary w-full md:w-auto">Edit Profile</button>
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

          {/* Right Column: Friends (Only if viewing own profile) */}
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
    </PageWrapper>
  );
}
