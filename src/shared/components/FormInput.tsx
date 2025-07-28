import React, { InputHTMLAttributes } from 'react';

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string,
  errorMessage?: string
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      id,
      label,
      type,
      className = "",
      errorMessage,
      ...rest
    },
    ref
  ) => {
    const baseInputClasses = `mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 ${className}`;

    const checkboxClasses = `h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ${className}`;

    return (
      <div className={type === 'checkbox' ? "flex items-center" : ""}>
        {type !== 'checkbox' && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}

        <input
          id={id}
          type={type}
          ref={ref}
          className={type === 'checkbox' ? checkboxClasses : baseInputClasses}
          {...rest}
        />

        {type === 'checkbox' && (
          <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
            {label}
          </label>
        )}

        {errorMessage && (
          <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
export default FormInput;
