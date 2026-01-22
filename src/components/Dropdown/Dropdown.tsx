import React, { useState, useRef, useEffect, useId } from 'react';
import cn from 'classnames';
import styles from './Dropdown.module.scss';
import type { DropdownOption } from './types';

interface Props {
    options: DropdownOption[];
    onSelect: (value: string) => void;
    trigger: React.ReactNode;
    label: string;
}

const Dropdown: React.FC<Props> = ({ options, onSelect, trigger, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const id = useId();
    const menuId = `dropdown-menu-${id}`;

    const closeMenu = () => {
        setIsOpen(false);
        setFocusedIndex(-1);
    };

    const openMenu = () => {
        setIsOpen(true);
        setFocusedIndex(0);
    };

    const toggleMenu = () => {
        if (isOpen) {
            return closeMenu();
        }

        return openMenu();
    };

    const handleSelect = (value: string) => {
        onSelect(value);
        closeMenu();
        triggerRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();

                if (isOpen && focusedIndex >= 0) {
                    handleSelect(options[focusedIndex].value);
                } else {
                    toggleMenu();
                }

                break;
            case 'ArrowDown':
                e.preventDefault();

                if (!isOpen) {
                    openMenu();
                } else {
                    setFocusedIndex((prev) => (prev + 1) % options.length);
                }

                break;
            case 'ArrowUp':
                e.preventDefault();

                if (isOpen) {
                    setFocusedIndex((prev) => (prev - 1 + options.length) % options.length);
                }

                break;
            case 'Escape':
                e.preventDefault();
                closeMenu();
                triggerRef.current?.focus();
                break;
            case 'Tab':
                closeMenu();
                break;
        }
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const isClickOutside = containerRef.current && !containerRef.current.contains(e.target as Node);

            if (isClickOutside) {
                closeMenu();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && focusedIndex >= 0 && itemsRef.current[focusedIndex]) {
            itemsRef.current[focusedIndex].focus();
        }
    }, [isOpen, focusedIndex]);



    return (
        <div className={styles.dropdown} ref={containerRef} onKeyDown={handleKeyDown}>
            <button
                ref={triggerRef}
                type="button"
                className={styles.trigger}
                onClick={toggleMenu}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls={menuId}
                aria-label={label}
            >
                {trigger}
            </button>

            {isOpen && (
                <ul
                    id={menuId}
                    className={styles.menu}
                    role="menu"
                    aria-labelledby={id}
                >
                    {options.map((option, index) => {
                        const isFocused = index === focusedIndex;

                        return (
                            <li key={option.value} role="none">
                                <button
                                    ref={(el) => { itemsRef.current[index] = el; }}
                                    type="button"
                                    role="menuitem"
                                    className={cn(styles.option, { [styles.focused]: isFocused })}
                                    onClick={() => handleSelect(option.value)}
                                    tabIndex={isFocused ? 0 : -1}
                                >
                                    <span className={styles.icon}>{option.icon}</span>
                                    {option.label}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    );
};

export default React.memo(Dropdown);
