import api from './axiosInstance';

export const getChallenges = async (page = 0, size = 10, communityId = null) => {
  const params = { page, size };
  if (communityId) params.communityId = communityId;
  const response = await api.get('/challenges', { params });
  return response.data;
};

export const createChallenge = async (data) => {
  const response = await api.post('/challenges', data);
  return response.data;
};

export const updateChallenge = async (id, data) => {
  const response = await api.put(`/challenges/${id}`, data);
  return response.data;
};

export const getMyChallenges = async () => {
  const response = await api.get('/challenges/my');
  return response.data;
};

export const getGlobalChallenges = async (page = 0, size = 10) => {
  const response = await api.get('/challenges/global', { params: { page, size } });
  return response.data;
};

export const getChallenge = async (id) => {
  const response = await api.get(`/challenges/${id}`);
  return response.data;
};

export const joinChallenge = async (id) => {
  const response = await api.post(`/challenges/${id}/join`);
  return response.data;
};

export const leaveChallenge = async (id) => {
  const response = await api.post(`/challenges/${id}/leave`);
  return response.data;
};

export const submitToChallenge = async (id, data) => {
  const response = await api.post(`/challenges/${id}/submit`, data);
  return response.data;
};

export const deleteChallenge = async (id) => {
  const response = await api.delete(`/challenges/${id}`);
  return response.data;
};
