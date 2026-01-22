import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage as sendMessageApi } from '../api/messages';
import { queryKeys } from '../api/queryKeys';
import { mutationKeys } from '../api/mutationKeys';
import { MessageStatus, type MessageInternal, type MessagesInfiniteData, type SendMessageVariables } from '../types/message';



const useSendMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: mutationKeys.sendMessage,
        mutationFn: ({ message, author }: SendMessageVariables) => sendMessageApi({ message, author }),
        onMutate: async ({ _id, message, author }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.messages.all });

            queryClient.setQueryData<MessagesInfiniteData>(queryKeys.messages.all, (oldMessages) => {
                if (!oldMessages) {
                    return oldMessages;
                }

                const messageExists = oldMessages.pages.some((page) =>
                    page.some((msg) => msg._id === _id)
                );

                if (messageExists) {
                    return {
                        ...oldMessages,
                        pages: oldMessages.pages.map((page) => {
                            const pageHasTarget = page.some((msg) => msg._id === _id);

                            if (!pageHasTarget) {
                                return page;
                            }

                            return page.map((msg) => {
                                const isTargetMessage = msg._id === _id;

                                if (isTargetMessage) {
                                    return { ...msg, status: MessageStatus.SENDING }
                                }

                                return msg
                            }
                            );
                        }),
                    };
                }

                const optimisticMessage: MessageInternal = {
                    _id,
                    message,
                    author,
                    createdAt: new Date(),
                    status: MessageStatus.SENDING,
                };

                return {
                    ...oldMessages,
                    pages: oldMessages.pages.map((page, i) => {
                        const isNewestPage = i === 0;

                        if (isNewestPage) {
                            return [...page, optimisticMessage]
                        }

                        return page
                    }
                    ),
                };
            });
        },
        onSuccess: (data, { _id }) => {
            queryClient.setQueryData<MessagesInfiniteData>(queryKeys.messages.all, (oldMessages) => {
                if (!oldMessages) {
                    return oldMessages
                };

                return {
                    ...oldMessages,
                    pages: oldMessages.pages.map((page) =>
                        page.map((msg) => {
                            const isTargetMessage = msg._id === _id;

                            if (isTargetMessage) {
                                return { ...msg, _id: data._id, status: MessageStatus.SENT }
                            }

                            return msg
                        }
                        )
                    ),
                };
            });
        },
        onError: (_error, { _id }) => {
            queryClient.setQueryData<MessagesInfiniteData>(queryKeys.messages.all, (oldMessages) => {
                if (!oldMessages) {
                    return oldMessages
                };

                return {
                    ...oldMessages,
                    pages: oldMessages.pages.map((page) =>
                        page.map((msg) => {
                            const isTargetMessage = msg._id === _id;

                            if (isTargetMessage) {
                                return { ...msg, status: MessageStatus.ERROR }
                            }

                            return msg
                        }
                        )
                    ),
                };
            });
        },
    });
};

export default useSendMessage;
