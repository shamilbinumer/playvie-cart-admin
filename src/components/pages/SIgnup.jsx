import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import TextInput from '../layout/TextInput';
import { addDoc, collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { Button } from '@mui/material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

export default function AdminRegisterPage() {
  const user = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const { adminId } = useParams(); 
  
  // Check if we're in edit mode
  const isEditMode = !!adminId;
  const editData = location.state?.adminData;
  console.log(editData);
  

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    superAdmin: false,
    isActive: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form data if in edit mode
  useEffect(() => {
    if (isEditMode && editData) {
      setFormData({
        firstName: editData.firstName || '',
        lastName: editData.lastName || '',
        email: editData.email || '',
        phone: editData.phone || '',
        password: editData.password || '',
        confirmPassword: editData.password || '',
        superAdmin: editData.superAdmin || false,
        isActive: editData.isActive ?? true
      });
    }
  }, [isEditMode, editData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const adminData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        superAdmin: formData.superAdmin,
        isActive: formData.isActive
      };

      if (isEditMode) {
        // Update existing admin
        const adminRef = doc(db, "admins", adminId);
        await updateDoc(adminRef, {
          ...adminData,
          updatedAt: new Date()
        });

        Swal.fire({
          title: "Success!",
          text: "Admin updated successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });

        // Navigate back after successful update
        navigate(-1);
      } else {
        // Create new admin
        const docRef = doc(collection(db, "admins"));
        await setDoc(docRef, {
          ...adminData,
          id: docRef.id,
          createdAt: new Date()
        });

        Swal.fire({
          title: "Success!",
          text: "Admin registered successfully.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          toast: true,
        });

        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          superAdmin: false,
          isActive: true
        });
      }
    } catch (error) {
      console.error("Error saving admin to Firestore:", error);
      Swal.fire({
        title: "Error!",
        text: isEditMode ? "Update failed. Please try again." : "Registration failed. Please try again.",
        icon: "error",
        confirmButtonText: "OK"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user?.user?.superAdmin) {
    return (
      <div className='w-full h-screen flex justify-center items-center'>
        <div className='text-center'>
          You Have Cannot Access This Page. This Page only can access super admin
          <div>
            <Button onClick={() => navigate(-1)}>Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-whit w-full p-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-25 w-25 rounded-full flex items-center justify-center mb-4">
            <img src="/Images/Playviecart.png" alt="" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit Admin' : 'Admin Registration'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isEditMode ? 'Update administrator account' : 'Create your administrator account'}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-2">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextInput
              label="First Name"
              placeholder="Enter First Name"
              value={formData.firstName}
              onChange={(value) => handleInputChange({ target: { name: 'firstName', value } })}
              error={errors.firstName}
              required
            />

            <TextInput
              label="Last Name"
              placeholder="Enter Last Name"
              value={formData.lastName}
              onChange={(value) => handleInputChange({ target: { name: 'lastName', value } })}
              error={errors.lastName}
              required
            />

            {/* Email */}
            <TextInput
              label="Email Address"
              type="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={(value) => handleInputChange({ target: { name: 'email', value } })}
              error={errors.email}
              required
            />

            {/* Phone */}
            <TextInput
              label="Phone Number"
              type="tel"
              placeholder="Enter Phone Number"
              value={formData.phone}
              onChange={(value) => handleInputChange({ target: { name: 'phone', value } })}
              error={errors.phone}
              required
            />

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange(e)}
                  name="password"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  } bg-white hover:border-gray-400`}
                  placeholder="Create a strong password"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange(e)}
                  name="confirmPassword"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  } bg-white hover:border-gray-400`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="superAdmin"
                checked={formData.superAdmin}
                onChange={handleInputChange}
                name="superAdmin"
                className="accent-[#81184e]"
              />
              <label htmlFor="superAdmin">Super Admin</label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                name="isActive"
                className="accent-[#81184e]"
              />
              <label htmlFor="isActive">Is Active</label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="mt-10 group relative flex-1 flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#81184e] hover:bg-[#61123b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isEditMode ? 'Updating...' : 'Creating Account...'}
                </div>
              ) : (
                isEditMode ? 'Update Admin Account' : 'Create Admin Account'
              )}
            </button>

            {isEditMode && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="mt-10 py-3 px-6 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}