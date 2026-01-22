import type { MessageResponse, SendMessagePayload, GetMessagesParams } from '../types/message';
import { config } from '../config';

const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.api.authToken}`,
};

export const sendMessage = async (payload: SendMessagePayload): Promise<MessageResponse> => {
    const response = await fetch(`${config.api.baseUrl}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
    }

    return response.json();
};

export const getMessages = async (params?: GetMessagesParams, signal?: AbortSignal): Promise<MessageResponse[]> => {
    const url = new URL(`${config.api.baseUrl}/messages`);

    if (params?.before) {
        url.searchParams.set('before', params.before);
    }

    if (params?.limit) {
        url.searchParams.set('limit', String(params.limit));
    }

    const response = await fetch(url.toString(), { headers, signal });

    if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
    }

    return response.json();
};
