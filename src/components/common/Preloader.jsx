import { Box, LinearProgress } from "@mui/material";

const Preloader = () => {
  return (
    // <div className="h-[calc(100vh-70px)] flex items-center justify-center bg-white z-50">
    //   {/* Loader Spinner */}
    //   <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
    // </div>
    <div>
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    </div>
  );
};

export default Preloader;