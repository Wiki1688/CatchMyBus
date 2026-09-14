import React from 'react';

interface GreetingHeaderProps {
  name: string;
  onEditName?: () => void;
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({ name, onEditName }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return `Good morning, ${name}`;
    }
    if (hour < 18) {
      return `Good afternoon, ${name}`;
    }
    return `Good evening, ${name}`;
  };

  return (
    <header className="top-header" id="app-header">
      <div className="top-header-row">
        <span className="app-brand">Catch My Bus!</span>
        {onEditName && (
          <button
            type="button"
            className="name-change-btn"
            onClick={onEditName}
            aria-label="Change name"
            id="change-name-btn"
          >
            Change name
          </button>
        )}
      </div>
      <h1 className="greeting-text" id="greeting-heading">
        {getGreeting()}
      </h1>
    </header>
  );
};
