import { useEffect, useState } from "react";

const Preloader = () => {
  const [loading, setLoading] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Auto-hide after 500ms (or whatever duration you want)
    const loadingTimer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(loadingTimer);
  }, []);

  useEffect(() => {
    if (!loading) {
      // Delay removal to allow fade out animation
      const fadeTimer = setTimeout(() => {
        setShouldRender(false);
      }, 500); // Duration should match CSS transition
      return () => clearTimeout(fadeTimer);
    }
  }, [loading]);

  if (!shouldRender) return null;

  return (
    <div
      className={`h-[calc(100vh-70px)] flex items-center justify-center bg-white z-50 transition-opacity duration-500 ${
        loading ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Loader Spinner */}
      <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );
};

export default Preloader;