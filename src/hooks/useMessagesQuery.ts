import { useInfiniteQuery } from '@tanstack/react-query';
import { getMessages } from '../api/messages';
import { queryKeys } from '../api/queryKeys';
import { MessageStatus, type MessageInternal } from '../types/message';

const MESSAGES_LIMIT = 20;

const useMessagesQuery = () => {
    return useInfiniteQuery<
        MessageInternal[],
        Error,
        MessageInternal[],
        typeof queryKeys.messages.all,
        string | undefined
    >({
        queryKey: queryKeys.messages.all,
        queryFn: async ({ pageParam = new Date().toISOString(), signal }) => {
            const data = await getMessages({ limit: MESSAGES_LIMIT, before: pageParam }, signal);

            return data.map((msg): MessageInternal => ({
                ...msg,
                createdAt: new Date(msg.createdAt),
                status: MessageStatus.SENT,
            }));
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => {
            if (lastPage.length < MESSAGES_LIMIT) {
                return undefined;
            }

            return lastPage[0]?.createdAt.toISOString();
        },

        select: (data) => [...data.pages].reverse().flat(),
    });
};

export default useMessagesQuery;
