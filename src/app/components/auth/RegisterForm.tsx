'use client';

import Button from "./Button.";
import FormInput from "./FormInput.";



const RegisterForm = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md shadow-sm space-y-4">
        <FormInput 
          id="name"
          label="Name"
          type="text"
          placeholder="Your full name"
          required
        />
        
        <FormInput 
          id="email"
          label="Email"
          type="email"
          placeholder="Example@email.com"
          required
        />
        
        <FormInput 
          id="password"
          label="Password"
          type="password"
          placeholder="at least 8 characters"
          required
        />
        
        <FormInput 
          id="confirmPassword"
          label="Konfirmasi Password"
          type="password"
          placeholder="at least 8 characters"
          required
        />
      </div>

      <div>
        <Button type="submit" fullWidth>
          Sign Up
        </Button>
      </div>
    </form>
  );
};

export default RegisterForm;