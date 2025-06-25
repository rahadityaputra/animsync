interface FormInputProps {
  id: string;
  name?: string; // Tambahkan ini sebagai optional
  label: string;
  type: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
  minLength?: number; // Tambahkan untuk support password
  className?: string; // Tambahkan untuk custom class
}

const FormInput = ({ 
  id, 
  name = id, // Default ke id jika name tidak disediakan
  label, 
  type, 
  placeholder, 
  required, 
  minLength,
  className = "" 
}: FormInputProps) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        className={`mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 ${className}`}
      />
    </div>
  );
};

export default FormInput;