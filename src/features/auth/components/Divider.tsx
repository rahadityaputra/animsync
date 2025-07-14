interface DividerProps {
  text?: string; // Menjadikan optional dengan '?' jika text tidak selalu diperlukan
}

const Divider = ({ text }: DividerProps) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>
      {text && ( // Hanya render jika text ada
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">
            {text}
          </span>
        </div>
      )}
    </div>
  );
};

export default Divider;