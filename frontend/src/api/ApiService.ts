import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sendMessageToApi = async (user_input : string): Promise<string> => {
  try {
    const response = await apiClient.post('/generate_response', { user_input });
    return response.data.response;
  } catch (error) {
    console.error('Erro na chamada da API:', error);
    throw new Error('Não foi possível obter uma resposta do servidor.');
  }
};