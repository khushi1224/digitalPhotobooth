import React from 'react';

const Select = ({ children, onValueChange }) => {
  return (
    <select 
      onChange={(e) => onValueChange(e.target.value)} 
      style={{ padding: '10px', borderRadius: '5px' }}
    >
      {children}
    </select>
  );
};

export default Select;
