import { useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-3">
          <button 
            onClick={() => window.history.back()} 
            className="block w-full sm:w-auto sm:inline-block bg-[#ac1f67] text-white px-6 py-2 rounded-md  transition-colors"
          >
            Go Back
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="block w-full sm:w-auto sm:inline-block sm:ml-4 bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}