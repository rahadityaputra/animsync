"use client";

type LoadingSpinnerProps = {
  fullPage?: boolean;
  message?: string;
};

export default function LoadingSpinner({ 
  fullPage = false, 
  message = "Loading project..." 
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${fullPage ? 'min-h-[80vh]' : 'py-8'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="text-gray-500 mt-3">{message}</p>
    </div>
  );
}