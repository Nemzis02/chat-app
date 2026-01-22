import type { InfiniteData } from '@tanstack/react-query';
import type { ObjectValues } from './common';

export const MessageStatus = {
    SENDING: 'sending',
    SENT: 'sent',
    ERROR: 'error',
} as const;

export type MessageStatus = ObjectValues<typeof MessageStatus>;

export interface MessageResponse {
    _id: string;
    message: string;
    author: string;
    createdAt: string;
}

export interface MessageInternal extends Omit<MessageResponse, 'createdAt'> {
    createdAt: Date;
    status?: MessageStatus;
}

export interface SendMessagePayload {
    message: string;
    author: string;
}

export interface SendMessageVariables extends SendMessagePayload {
    _id: string;
}

export interface GetMessagesParams {
    before?: string;
    limit?: number;
}

export type MessagesInfiniteData = InfiniteData<MessageInternal[], string | undefined>;