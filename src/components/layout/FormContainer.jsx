import React from "react";

const FormContainer = ({
  title,
  children,
  onCancel,
  onSubmit,
  cancelText = "Cancel",
  submitText = "Submit",
}) => {
  return (
    <div className=" mx-auto p-1 pb-8">
      <div className="bg-white rounded-lg">
        {/* Header */}
        <div className="p-3">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>

        {/* Body (form inputs go here) */}
        <div className="p-6 space-y-6">{children}</div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 pr-5">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {cancelText}
            </button>
          )}
          {onSubmit && (
            <button
              type="button"
              onClick={onSubmit}
              className="px-6 py-2 bg-[#81184e] text-white rounded-md hover:bg-[#4d0b2d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {submitText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormContainer;
