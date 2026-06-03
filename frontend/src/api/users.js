import api from './axiosInstance';

export const getMyProfile = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const getMyBadges = async () => {
  const response = await api.get('/users/me/badges');
  return response.data;
};

export const getUserBadges = async (userId) => {
  const response = await api.get(`/users/${userId}/badges`);
  return response.data;
};

export const getUserProfile = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const getFriendshipStatus = async (userId) => {
  const response = await api.get(`/users/${userId}/friendship-status`);
  return response.data;
};
