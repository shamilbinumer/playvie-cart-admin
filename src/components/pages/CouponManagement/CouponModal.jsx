import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import TextInput from '../../layout/TextInput';
import TextArea from '../../layout/TextArea';
import SearchableDropdown from '../../layout/SearchabelDropdown';

const CouponModal = ({ isOpen, onClose, mode, couponData, onSave }) => {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    maxDiscount: '',
    minPurchase: '',
    expiryDate: '',
    usageLimit: '',
    oneTimePerUser: false,
    active: true,
  });

  const [errors, setErrors] = useState({});
  const viewMode = mode === 'view';

  // Discount type options
  const discountTypeOptions = [
    { value: 'percentage', label: 'Percentage (%)' },
    { value: 'fixed', label: 'Fixed Amount (₹)' }
  ];

  // Status options
  const statusOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' }
  ];

  useEffect(() => {
    if (couponData && (mode === 'edit' || mode === 'view')) {
      setFormData({
        code: couponData.code || '',
        description: couponData.description || '',
        discountType: couponData.discountType || 'percentage',
        discountValue: couponData.discountValue || '',
        maxDiscount: couponData.maxDiscount || '',
        minPurchase: couponData.minPurchase || '',
        expiryDate: couponData.expiryDate 
          ? new Date(couponData.expiryDate.toDate()).toISOString().split('T')[0]
          : '',
        usageLimit: couponData.usageLimit || '',
        oneTimePerUser: couponData.oneTimePerUser || false,
        active: couponData.active !== undefined ? couponData.active : true,
      });
    } else {
      // Reset form for add mode
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        maxDiscount: '',
        minPurchase: '',
        expiryDate: '',
        usageLimit: '',
        oneTimePerUser: false,
        active: true,
      });
    }
    setErrors({});
  }, [couponData, mode]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Coupon code is required';
    } else if (formData.code.length < 3) {
      newErrors.code = 'Code must be at least 3 characters';
    } else if (!/^[A-Z0-9]+$/.test(formData.code.toUpperCase())) {
      newErrors.code = 'Code can only contain letters and numbers';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.discountValue || formData.discountValue <= 0) {
      newErrors.discountValue = 'Discount value must be greater than 0';
    }

    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      newErrors.discountValue = 'Percentage cannot exceed 100%';
    }

    if (formData.maxDiscount && formData.maxDiscount <= 0) {
      newErrors.maxDiscount = 'Max discount must be greater than 0';
    }

    if (formData.minPurchase && formData.minPurchase < 0) {
      newErrors.minPurchase = 'Min purchase cannot be negative';
    }

    if (formData.usageLimit && formData.usageLimit <= 0) {
      newErrors.usageLimit = 'Usage limit must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const couponPayload = {
      code: formData.code.toUpperCase(),
      description: formData.description,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
      minPurchase: formData.minPurchase ? Number(formData.minPurchase) : null,
      expiryDate: formData.expiryDate 
        ? Timestamp.fromDate(new Date(formData.expiryDate)) 
        : null,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      oneTimePerUser: formData.oneTimePerUser,
      active: formData.active,
    };

    onSave(couponPayload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#00000080] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-[80%] w-full max-h-[80vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'add' ? 'Add New Coupon' : mode === 'edit' ? 'Edit Coupon' : 'View Coupon'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-2 space-y-2">
          {/* Coupon Code */}
          <TextInput
            label="Coupon Code"
            placeholder="Enter coupon code (e.g., SAVE20)"
            value={formData.code}
            onChange={(value) => handleInputChange('code', value.toUpperCase())}
            error={errors.code}
            disabled={viewMode || mode === 'edit'}
            required
            helpText="Must be unique, 3+ characters, letters and numbers only"
          />

          {/* Description */}
          <TextArea
            label="Description"
            placeholder="Enter coupon description"
            value={formData.description}
            onChange={(value) => handleInputChange('description', value)}
            error={errors.description}
            disabled={viewMode}
            required
            rows={3}
          />

          {/* Discount Type and Value */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            <SearchableDropdown
              label="Discount Type"
              options={discountTypeOptions}
              value={formData.discountType}
              onChange={(value) => handleInputChange('discountType', value)}
              placeholder="Select discount type"
              error={errors.discountType}
              disabled={viewMode}
              required
            />

            <TextInput
              label={formData.discountType === 'percentage' ? 'Discount (%)' : 'Discount (₹)'}
              type="number"
              placeholder="Enter discount value"
              value={formData.discountValue}
              onChange={(value) => handleInputChange('discountValue', value)}
              error={errors.discountValue}
              disabled={viewMode}
              required
              min="0"
              step="0.01"
            />
             {/* Max Discount (only for percentage) */}
          {formData.discountType === 'percentage' && (
            <TextInput
              label="Maximum Discount (₹)"
              type="number"
              placeholder="Enter max discount cap (optional)"
              value={formData.maxDiscount}
              onChange={(value) => handleInputChange('maxDiscount', value)}
              error={errors.maxDiscount}
              disabled={viewMode}
              min="0"
              helpText="Maximum discount amount that can be applied"
            />
          )}
          </div>

         

          {/* Min Purchase and Usage Limit */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <TextInput
              label="Minimum Purchase (₹)"
              type="number"
              placeholder="Enter minimum purchase amount"
              value={formData.minPurchase}
              onChange={(value) => handleInputChange('minPurchase', value)}
              error={errors.minPurchase}
              disabled={viewMode}
              min="0"
              helpText="Leave empty for no minimum"
            />

            <TextInput
              label="Usage Limit"
              type="number"
              placeholder="Enter usage limit"
              value={formData.usageLimit}
              onChange={(value) => handleInputChange('usageLimit', value)}
              error={errors.usageLimit}
              disabled={viewMode}
              min="0"
              helpText="Leave empty for unlimited"
            />
              {/* Expiry Date */}
          <TextInput
            label="Expiry Date"
            type="date"
            value={formData.expiryDate}
            onChange={(value) => handleInputChange('expiryDate', value)}
            error={errors.expiryDate}
            disabled={viewMode}
            helpText="Leave empty for no expiry"
          />

          {/* One Time Per User Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="oneTimePerUser"
              checked={formData.oneTimePerUser}
              onChange={(e) => handleInputChange('oneTimePerUser', e.target.checked)}
              disabled={viewMode}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="oneTimePerUser" className="text-sm font-medium text-gray-700">
              One time per user
            </label>
          </div>

          {/* Active Status */}
          <SearchableDropdown
            label="Status"
            options={statusOptions}
            value={formData.active}
            onChange={(value) => handleInputChange('active', value)}
            placeholder="Select status"
            disabled={viewMode}
            required
          />
          </div>
        

          {/* Usage Stats (only in view/edit mode) */}
          {(mode === 'edit' || mode === 'view') && couponData && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold text-gray-800 mb-2">Usage Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Times Used:</span>
                  <span className="ml-2 font-medium text-gray-900">{couponData.usedCount || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Unique Users:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {couponData.usersUsed?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {viewMode ? 'Close' : 'Cancel'}
            </button>
            {!viewMode && (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {mode === 'add' ? 'Create Coupon' : 'Update Coupon'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponModal;