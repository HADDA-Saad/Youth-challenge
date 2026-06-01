import api from './axiosInstance';

export const getGlobalLeaderboard = async () => {
  const response = await api.get('/leaderboard/global');
  return response.data;
};

export const getFriendsLeaderboard = async () => {
  const response = await api.get('/leaderboard/friends');
  return response.data;
};

export const getChallengeLeaderboard = async (challengeId) => {
  const response = await api.get(`/leaderboard/challenge/${challengeId}`);
  return response.data;
};
