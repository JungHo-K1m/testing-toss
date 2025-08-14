import api from '@/shared/api/axiosInstance';

// 유저 삭제
export const deleteUser = async (): Promise<any> => {
  const response = await api.get('/delete/user');

  if (response.data.code === 'OK') {
    return response.data.data;
  } else {
    // console.error('Unexpected response:', response);
    throw new Error(response.data.message || 'Failed to fetch ranking information');
  }
};


export default deleteUser;
