import api from './axiosInstance';

export const sendFriendRequest = async (userId) => {
  const response = await api.post(`/friends/request/${userId}`);
  return response.data;
};

export const acceptFriendRequest = async (requestId) => {
  const response = await api.put(`/friends/accept/${requestId}`);
  return response.data;
};

export const declineOrRemoveFriend = async (requestId) => {
  const response = await api.delete(`/friends/${requestId}`);
  return response.data;
};

export const getAcceptedFriends = async () => {
  const response = await api.get('/friends');
  return response.data;
};

export const getPendingRequests = async () => {
  const response = await api.get('/friends/pending');
  return response.data;
};
