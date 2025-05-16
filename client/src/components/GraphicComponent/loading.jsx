const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="relative">
        {/* Outer glowing circle */}
        <div className="absolute inset-0 animate-ping rounded-full border-4 border-opacity-30 border-red-500"></div>
        {/* Main spinner */}
        <div className="h-16 w-16 rounded-full border-4 border-t-red-500 border-gray-200 animate-spin"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
