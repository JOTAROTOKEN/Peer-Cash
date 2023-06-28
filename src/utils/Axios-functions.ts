// server configuration
import axios from 'axios';
import { SERVER_URL } from '../constants';

const getCommitment = async () => {
    const response = await axios.get(`${SERVER_URL}/getCommitment`);
    return response.data;
}

const getProof = async (note: string, recipient: string) => {
    const response = await axios.post(`${SERVER_URL}/getProof`, {
        note: note,
        recipient: recipient
    });
    if(response.data.failed)
        throw new Error(response.data.msg);
    return response.data;
}
export { getCommitment, getProof };
