import React from 'react';

const sizeMap = {
  sm: 'btn-sm',
  md: '',
};

const variantMap = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  icon: 'btn-icon',
  danger: 'btn-danger',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  disabled,
  onClick,
  style,
  className = '',
  ...rest
}) {
  const classes = [
    variantMap[variant] || 'btn-primary',
    sizeMap[size] || '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      {...rest}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      style={style}
    >
      {icon && <span className="btn-icon-slot">{icon}</span>}
      {children}
    </button>
  );
}
