import React from 'react';

const Input = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input 
      ref={ref}
      className={`input-field ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
