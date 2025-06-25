'use client';

import Button from "./Button.";
import FormInput from "./FormInput.";



const ForgotPasswordForm = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md shadow-sm space-y-4">
        <FormInput 
          id="email"
          label="Email"
          type="email"
          placeholder="Example@email.com"
          required
        />
      </div>

      <div className="text-sm text-center">
        <p className="text-gray-600">
          We will send you an email to reset your password
        </p>
      </div>

      <div>
        <Button type="submit" fullWidth>
          Change Password
        </Button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;