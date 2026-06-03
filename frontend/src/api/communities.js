import api from './axiosInstance';

export const getCommunities = async () => {
  const response = await api.get('/communities');
  return response.data;
};

export const createCommunity = async (data) => {
  const response = await api.post('/communities', data);
  return response.data;
};

export const getCommunity = async (id) => {
  const response = await api.get(`/communities/${id}`);
  return response.data;
};

export const getCommunityMembers = async (id) => {
  const response = await api.get(`/communities/${id}/members`);
  return response.data;
};

export const joinCommunity = async (id) => {
  const response = await api.post(`/communities/${id}/join`);
  return response.data;
};

export const leaveCommunity = async (id) => {
  const response = await api.post(`/communities/${id}/leave`);
  return response.data;
};

export const addCommunityBadge = async (id, data) => {
  const response = await api.post(`/communities/${id}/badges`, data);
  return response.data;
};

export const getCommunityBadges = async (id) => {
  const response = await api.get(`/communities/${id}/badges`);
  return response.data;
};

export const deleteCommunityBadge = async (communityId, badgeId) => {
  const response = await api.delete(`/communities/${communityId}/badges/${badgeId}`);
  return response.data;
};

export const getMyCommunityBadges = async () => {
  const response = await api.get(`/communities/my-badges`);
  return response.data;
};

export const updateCommunity = async (id, data) => {
  const response = await api.put(`/communities/${id}`, data);
  return response.data;
};

export const deleteCommunity = async (id) => {
  const response = await api.delete(`/communities/${id}`);
  return response.data;
};

export const assignRole = async (id, data) => {
  const response = await api.post(`/communities/${id}/roles`, data);
  return response.data;
};
