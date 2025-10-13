import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { loginSuccess } from "../../redux/slices/authSlice";
import { useDispatch } from "react-redux";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { createToken } from "../../utils/tokenUtils";

const Login = () => {
    const dispatch = useDispatch()
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Enter a valid email";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        }
        return newErrors;
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     const newErrors = validateForm();

    //     if (Object.keys(newErrors).length > 0) {
    //         setErrors(newErrors);
    //         return;
    //     }

    //     setIsSubmitting(true);
    //     try {
    //         // Query Firestore for admin credentials
    //         const adminsRef = collection(db, "users");
    //         const q = query(
    //             adminsRef,
    //             where("email", "==", formData.email),
    //             where("password", "==", formData.password)
    //         );

    //         const querySnapshot = await getDocs(q);

    //         if (!querySnapshot.empty) {
    //             const adminData = querySnapshot.docs[0].data();

    //             localStorage.setItem("adminLoggedIn", "true");
    //             localStorage.setItem("adminEmail", adminData.email);
    //             dispatch(loginSuccess(adminData));
    //             Swal.fire({
    //                 title: "Success!",
    //                 text: "Logined successfully.",
    //                 icon: "success",
    //                 showConfirmButton: false,
    //                 timer: 2000,
    //                 toast: true,
    //             });
    //             navigate('/')
    //         } else {
    //             // No matching credentials found
    //             alert("Invalid email or password.");
    //         }
    //     } catch (error) {
    //         console.error("Login failed:", error.message);
    //         alert("An error occurred. Please try again.");
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const q = query(
                collection(db, "admins"),
                where("email", "==", formData.email),
                where("password", "==", formData.password)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                console.log(userData);
                const token = createToken({
                    email: userData.email,
                    role: userData.role || "admin",
                    lastName:userData.lastName,
                    firstName:userData.firstName,
                    userId:userData.id,
                    superAdmin:userData.superAdmin
                });         
                localStorage.setItem("authToken", token);
                Swal.fire({
                    title: "Success!",
                    text: "Login successful.",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                });

                navigate("/dashboard");
            } else {
                Swal.fire({
                    title: "Error!",
                    text: "Invalid email or password",
                    icon: "error",
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        } catch (error) {
            console.error("Login failed:", error);
            Swal.fire("Error!", "Something went wrong.", "error");
        }finally{
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-md p-8 space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-4">
                        <img src="/Images/Playviecart.png" alt="logo" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Admin Login</h2>
                    <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
                </div>

                {/* Form */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="admin@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email
                                ? "border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:border-blue-500"
                                } bg-white hover:border-gray-400`}
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${errors.password
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:border-blue-500"
                                    } bg-white hover:border-gray-400`}
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#81184e] hover:bg-[#61123b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Signing in...
                            </div>
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;