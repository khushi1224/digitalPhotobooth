import React from 'react';

const Button = ({ children, onClick, disabled }) => {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      style={{ 
        padding: '10px', 
        background: disabled ? 'gray' : 'blue', 
        color: 'white', 
        border: 'none', 
        borderRadius: '5px',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      {children}
    </button>
  );
};

export { Button as default };
