import React, { useCallback, useMemo } from 'react';
import cn from 'classnames';
import { MessageStatus, type MessageInternal } from '../../types/message';
import { formatDate } from '../../utils';
import Spinner from '../Spinner';
import Dropdown, { type DropdownOption } from '../Dropdown';

import styles from './Message.module.scss';
import RetryIcon from '../../icons/RetryIcon';
import DeleteIcon from '../../icons/DeleteIcon';
import CheckIcon from '../../icons/CheckIcon';
import ErrorIcon from '../../icons/ErrorIcon';
import MoreIcon from '../../icons/MoreIcon';

const ICON_SIZE_SM = 14;
const ICON_SIZE_MD = 16;

const DROPDOWN_VALUES = {
    RETRY: 'retry',
    DELETE: 'delete',
} as const;

const DROPDOWN_OPTIONS: DropdownOption[] = [
    { label: 'Retry', value: DROPDOWN_VALUES.RETRY, icon: <RetryIcon size={ICON_SIZE_SM} /> },
    { label: 'Delete', value: DROPDOWN_VALUES.DELETE, icon: <DeleteIcon size={ICON_SIZE_SM} /> },
];

interface Props {
    message: MessageInternal;
    isOwn: boolean;
    onRetry: (messageId: string) => void;
    onDelete: (messageId: string) => void;
}

const Message: React.FC<Props> = ({ message, isOwn, onRetry, onDelete }) => {
    const formattedDate = useMemo(
        () => formatDate(message.createdAt),
        [message.createdAt]
    );

    const handleDropdownSelect = useCallback((value: string) => {
        if (value === DROPDOWN_VALUES.RETRY) {
            return onRetry(message._id);
        }

        if (value === DROPDOWN_VALUES.DELETE) {
            return onDelete(message._id);
        }

    }, [message._id, onRetry, onDelete]);

    const renderStatus = () => {
        if (!isOwn) {
            return null
        };

        switch (message.status) {
            case MessageStatus.SENDING:
                return (
                    <span className={styles.status} aria-label="Sending">
                        <Spinner size="sm" />
                    </span>
                );
            case MessageStatus.SENT:
                return (
                    <span className={cn(styles.status, styles.sent)} aria-label="Sent">
                        <CheckIcon size={ICON_SIZE_SM} />
                    </span>
                );
            case MessageStatus.ERROR:
                return (
                    <span className={cn(styles.status, styles.error)} aria-label="Error">
                        <ErrorIcon size={ICON_SIZE_SM} />
                        <Dropdown
                            options={DROPDOWN_OPTIONS}
                            onSelect={handleDropdownSelect}
                            trigger={<MoreIcon size={ICON_SIZE_MD} />}
                            label="Message actions"
                        />
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <article
            className={cn(styles.message, { [styles.own]: isOwn, [styles.other]: !isOwn })}
            aria-label={`Message from ${message.author}`}
        >
            <div className={styles.bubble}>
                {!isOwn && <span className={styles.author}>{message.author}</span>}

                <p className={styles.text}>{message.message}</p>

                <div className={styles.footer}>
                    <time className={styles.timestamp} dateTime={message.createdAt.toISOString()}>
                        {formattedDate}
                    </time>
                    {renderStatus()}
                </div>
            </div>
        </article>
    );
};

export default React.memo(Message);
