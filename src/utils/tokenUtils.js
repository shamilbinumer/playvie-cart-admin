import CryptoJS from "crypto-js";

const SECRET_KEY = "00000"; // keep it private

// Create a token with expiration
export const createToken = (userData, expiresIn = 3600) => {
  const payload = {
    ...userData,
    exp: Date.now() + expiresIn * 1000, // 1 hour expiry
  };

  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    SECRET_KEY
  ).toString();

  return encrypted;
};

// Validate and decode token
export const validateToken = (token) => {
  try {
    const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    if (Date.now() > decryptedData.exp) {
      console.warn("Token expired");
      return null;
    }

    return decryptedData;
  } catch (error) {
    console.error("Invalid token");
    return null;
  }
};
