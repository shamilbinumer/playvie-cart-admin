import React from "react";
import { Snackbar, Alert } from "@mui/material";
import { motion } from "framer-motion";

const AnimatedAlert = ({ open, onClose, message, severity }) => {
  return (
   <div className="z-[99999999999999]"> 
     <Snackbar
      open={open}
      autoHideDuration={3000} // auto close after 3s
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      TransitionComponent={(props) => (
        <motion.div
          {...props}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.4 }}
        />
      )}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          borderRadius: "12px",
          fontSize: "0.9rem",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        {message}
      </Alert>
    </Snackbar>
   </div>
  );
};

export default AnimatedAlert;
