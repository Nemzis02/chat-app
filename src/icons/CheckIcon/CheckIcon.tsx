import React from 'react';
import type { IconProps } from '../../types/common';

const CheckIcon: React.FC<IconProps> = ({ size = 14, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export default CheckIcon;
