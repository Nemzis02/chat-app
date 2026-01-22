import React, { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { MessageInternal } from '../../types/message';
import Message from '../Message';
import Spinner from '../Spinner';
import styles from './MessageList.module.scss';

const ESTIMATED_MESSAGE_HEIGHT = 100;
const LIST_PADDING = 16;

interface Props {
    messages: MessageInternal[];
    currentUserId: string;
    onRetry: (messageId: string) => void;
    onDelete: (messageId: string) => void;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    fetchNextPage: () => void;
}

const MessageList: React.FC<Props> = ({
    messages,
    currentUserId,
    onRetry,
    onDelete,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
}) => {
    const listRef = useRef<HTMLDivElement>(null);
    const topSentinelRef = useRef<HTMLDivElement>(null);
    const lastMessageIdRef = useRef<string | null>(null);
    const firstMessageIdRef = useRef<string | null>(null);
    const topVisibleMessageIdRef = useRef<string | null>(null);
    const isInitialMount = useRef(true);
    const wasIntersectingRef = useRef(true);

    // eslint-disable-next-line react-hooks/incompatible-library
    const virtualizer = useVirtualizer({
        count: messages.length,
        getScrollElement: () => listRef.current,
        estimateSize: () => ESTIMATED_MESSAGE_HEIGHT,
        overscan: 5,
        paddingStart: LIST_PADDING,
    });

    const virtualItems = virtualizer.getVirtualItems();

    useEffect(() => {
        const scrollContainer = listRef.current;

        if (!scrollContainer) {
            return;
        }

        const handleScroll = () => {
            const firstVisibleItem = virtualizer.getVirtualItems()[0];

            if (firstVisibleItem) {
                topVisibleMessageIdRef.current = messages[firstVisibleItem.index]?._id ?? null;
            }
        };

        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, [virtualizer, messages]);

    useEffect(() => {
        if (messages.length === 0) {
            return;
        }

        const firstMessage = messages[0];
        const lastMessage = messages[messages.length - 1];
        const isNewMessageSent = !isInitialMount.current && lastMessage._id !== lastMessageIdRef.current;

        const olderMessagesLoaded = !isInitialMount.current &&
            firstMessageIdRef.current &&
            firstMessage._id !== firstMessageIdRef.current;

        if (isInitialMount.current || isNewMessageSent) {
            virtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
            isInitialMount.current = false;
        } else if (olderMessagesLoaded && topVisibleMessageIdRef.current) {
            const messageIndex = messages.findIndex((m) => m._id === topVisibleMessageIdRef.current);

            if (messageIndex !== -1) {
                virtualizer.scrollToIndex(messageIndex, { align: 'start' });
            }
        }

        firstMessageIdRef.current = firstMessage._id;
        lastMessageIdRef.current = lastMessage._id;
    }, [messages, virtualizer]);

    useEffect(() => {
        const sentinel = topSentinelRef.current;
        const scrollContainer = listRef.current;

        if (!sentinel || !scrollContainer) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                const isIntersecting = entry.isIntersecting;
                const justBecameVisible = isIntersecting && !wasIntersectingRef.current;
                wasIntersectingRef.current = isIntersecting;

                if (justBecameVisible && !isInitialMount.current && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            {
                root: scrollContainer,
                rootMargin: '16px 0px 0px 0px',
            }
        );

        observer.observe(sentinel);

        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <div
            ref={listRef}
            className={styles.list}
            role="log"
            aria-label="Chat messages"
            aria-live="polite"
        >
            <div
                className={styles.virtualContainer}
                style={{ height: virtualizer.getTotalSize() }}
            >
                <div ref={topSentinelRef} className={styles.sentinel} />

                {isFetchingNextPage && (
                    <div className={styles.loadingMore}>
                        <Spinner size="sm" />
                    </div>
                )}

                {virtualItems.map((virtualItem) => {
                    const message = messages[virtualItem.index];

                    return (
                        <div
                            key={message._id}
                            data-index={virtualItem.index}
                            ref={virtualizer.measureElement}
                            className={styles.virtualItem}
                            style={{ transform: `translateY(${virtualItem.start}px)` }}
                        >
                            <Message
                                message={message}
                                isOwn={message.author === currentUserId}
                                onRetry={onRetry}
                                onDelete={onDelete}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default React.memo(MessageList);
