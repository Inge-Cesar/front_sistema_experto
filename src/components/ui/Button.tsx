import React from 'react';

type BtnVariant = 'primary' | 'success' | 'danger' | 'ghost' | 'ai' | 'info' | 'glass';
type BtnSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  block?: boolean;
  iconOnly?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size,
  block = false,
  iconOnly = false,
  children,
  className = '',
  ...props
}) => {
  const classes = [
    'btn',
    `btn-${variant}`,
    size ? `btn-${size}` : '',
    block ? 'btn-block' : '',
    iconOnly ? 'btn-icon-only' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
