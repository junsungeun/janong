import React from 'react';

const variantMap = {
  default: 'card',
  highlight: 'card card-highlight',
  warning: 'card card-warning',
};

export default function Card({
  variant = 'default',
  children,
  style,
  className = '',
  onClick,
}) {
  const classes = [
    variantMap[variant] || 'card',
    onClick ? 'card-clickable' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={style} onClick={onClick}>
      {children}
    </div>
  );
}
