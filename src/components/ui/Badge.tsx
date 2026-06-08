import React from 'react';

export type BadgeStatus = 'green' | 'yellow' | 'red';

interface BadgeProps {
  status: BadgeStatus;
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ status, children }) => {
  const statusText = {
    'green': 'Apto',
    'yellow': 'Precaución',
    'red': 'Riesgo / Bloqueado'
  };

  return (
    <span className={`badge badge-${status}`}>
      {children || statusText[status]}
    </span>
  );
};
