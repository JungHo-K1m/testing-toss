import api from '@/shared/api/axiosInstance';

async function getDiagnosisList(type: string | null, record: string | null, petId: string, navigate: any): Promise<any> {
    try {
        const filter = {
            type: type,
            record: record,
            petId: petId
        };

        const response = await api.post('/diagnosis', filter);

        if (response.data.code === 'OK') {
            return response.data.data ?? null;
        } else {
            throw new Error(response.data.message || 'Failed to fetch diagnosis list');
        }
    } catch (error: any) {
        // console.error('에러 발생 시점:', error.message);
    }
}

export default getDiagnosisList;
