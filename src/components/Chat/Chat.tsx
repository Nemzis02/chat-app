import { useMutationState, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { mutationKeys } from '../../api/mutationKeys';
import { queryKeys } from '../../api/queryKeys';
import { CURRENT_AUTHOR_NAME, EMPTY_MESSAGES } from '../../constants';
import { useMessagesQuery, usePageTitle, useSendMessage } from '../../hooks';
import type { MessagesInfiniteData } from '../../types/message';
import Button from '../Button';
import Input from '../Input';
import MessageList from '../MessageList';
import Spinner from '../Spinner';
import styles from './Chat.module.scss';

const Chat: React.FC = () => {
    const queryClient = useQueryClient();
    const [inputValue, setInputValue] = useState('');

    const {
        data: messages = EMPTY_MESSAGES,
        isLoading,
        isError,
        error,
        refetch,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
    } = useMessagesQuery();

    const { mutate: sendMessage } = useSendMessage();

    const pendingMutations = useMutationState({
        filters: { mutationKey: mutationKeys.sendMessage, status: 'pending' },
        select: (mutation) => mutation.state.status,
    });

    const trimmedInputValue = useMemo(() => inputValue.trim(), [inputValue]);
    const isButtonDisabled = !trimmedInputValue;
    const sendingCount = pendingMutations.length;
    const pageTitle = sendingCount > 0 ? `(${sendingCount}) Sending... - Chat` : 'Chat';

    usePageTitle(pageTitle);

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    }, []);

    const handleSubmit = useCallback((e: FormEvent) => {
        e.preventDefault();

        if (trimmedInputValue) {
            sendMessage({ message: trimmedInputValue, author: CURRENT_AUTHOR_NAME, _id: crypto.randomUUID() });
            setInputValue('');
        }
    }, [trimmedInputValue, sendMessage]);

    const handleRetry = useCallback((id: string) => {
        const message = messages.find((m) => m._id === id);

        if (!message) {
            return;
        }

        sendMessage({ message: message.message, author: CURRENT_AUTHOR_NAME, _id: id });
    }, [messages, sendMessage]);

    const handleDelete = useCallback((id: string) => {
        queryClient.setQueryData<MessagesInfiniteData>(queryKeys.messages.all, (oldMessages) => {
            if (!oldMessages) {
                return oldMessages
            };

            return {
                ...oldMessages,
                pages: oldMessages.pages.map((page) => page.filter((msg) => msg._id !== id)),
            };
        });
    }, [queryClient]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className={styles.centerContent}>
                    <Spinner size="md" />
                    <span className={styles.loadingTitle}>Loading messages...</span>
                </div>
            );
        }

        if (isError) {
            return (
                <div className={styles.centerContent}>
                    <span className={styles.errorTitle}>Failed to load messages</span>
                    {error?.message && <p className={styles.errorDetail}>{error.message}</p>}
                    <Button onClick={() => refetch()}>Retry</Button>
                </div>
            );
        }

        return (
            <>
                <MessageList
                    messages={messages}
                    currentUserId={CURRENT_AUTHOR_NAME}
                    onRetry={handleRetry}
                    onDelete={handleDelete}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    fetchNextPage={fetchNextPage}
                />
                <form className={styles.inputForm} onSubmit={handleSubmit}>
                    <Input
                        type="text"
                        placeholder="Message"
                        value={inputValue}
                        onChange={handleInputChange}
                        aria-label="Type your message"
                        autoFocus
                    />
                    <Button type="submit" disabled={isButtonDisabled} aria-label="Send message">
                        Send
                    </Button>
                </form>
            </>
        );
    };

    return (
        <main className={styles.chat}>
            {renderContent()}
        </main>
    );
};

export default React.memo(Chat);
