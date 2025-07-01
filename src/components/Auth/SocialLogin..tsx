'use client';


import { useState } from 'react';
import Divider from './Divider.';
import Button from './Button.';

const SocialLogin = () => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div className="mt-6">
      <Divider text="Or" />
      
      <div className="mt-6">
        <Button 
          fullWidth 
          variant="outline"
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          onClick={() => {
            console.log('Signing in with Google');
          }}
          className={isPressed ? 'transform scale-95' : ''}
        >
          <div className="flex items-center justify-center">
            <svg 
              className={`w-5 h-5 mr-2 transition-transform duration-150 ${isPressed ? 'scale-90' : ''}`}
              aria-hidden="true" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
            </svg>
            <span className={`transition-transform duration-150 ${isPressed ? 'scale-95' : ''}`}>
              Sign in with Google
            </span>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default SocialLogin;