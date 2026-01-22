import React from 'react';
import cn from 'classnames';
import type { SpinnerSize } from './types';
import styles from './Spinner.module.scss';

interface Props {
    size?: SpinnerSize;
    className?: string;
}

const Spinner: React.FC<Props> = ({ size = 'sm', className }) => {
    return (
        <span
            className={cn(styles.spinner, styles[size], className)}
            role="status"
            aria-label="Loading"
        >
            <span className={styles.visuallyHidden}>Loading...</span>
        </span>
    );
};

export default Spinner;
