import React, { type ButtonHTMLAttributes } from 'react';
import cn from 'classnames';
import styles from './Button.module.scss';

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

const Button: React.FC<Props> = ({
    children,
    className,
    disabled,
    ...props
}) => {
    return (
        <button
            className={cn(styles.button, className)}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default React.memo(Button);
