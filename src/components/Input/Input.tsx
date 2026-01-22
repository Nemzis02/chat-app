import React, { type InputHTMLAttributes } from 'react';
import cn from 'classnames';
import styles from './Input.module.scss';

type Props = InputHTMLAttributes<HTMLInputElement>;

const Input: React.FC<Props> = ({ className, ...props }) => {
    return (
        <input
            className={cn(styles.input, className)}
            {...props}
        />
    );
};

export default React.memo(Input);
