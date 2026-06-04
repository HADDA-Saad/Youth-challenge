import api from './axiosInstance';

export const getFeedItems = async (page = 0, size = 20) => {
  try {
    const response = await api.get(`/feed?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch feed',
    };
  }
};
