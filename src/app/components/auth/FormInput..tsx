interface FormInputProps {
  id: string;
  label: string;
  type: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
}

const FormInput = ({ id, label, type, placeholder, required }: FormInputProps) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
     <input
        id={id}
        name={id}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
      />
    </div>
  );
};

export default FormInput;