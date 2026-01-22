import React from 'react';
import type { IconProps } from '../../types/common';

const MoreIcon: React.FC<IconProps> = ({ size = 16, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
    >
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="5" r="2" />
        <circle cx="12" cy="19" r="2" />
    </svg>
);

export default MoreIcon;
