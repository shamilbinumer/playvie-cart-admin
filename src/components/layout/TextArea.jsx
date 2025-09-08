// Textarea Component
const TextArea = ({ 
  label, 
  placeholder = '', 
  value = '', 
  onChange, 
  error = '', 
  disabled = false,
  required = false,
  rows = 4,
  maxLength
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        className={`w-full px-3 py-2 border rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y min-h-[100px] ${
          error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500'
        } ${
          disabled 
            ? 'bg-gray-100 cursor-not-allowed' 
            : 'bg-white hover:border-gray-400'
        }`}
      />
      <div className="flex justify-between items-center mt-1">
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {maxLength && (
          <p className="text-sm text-gray-500 ml-auto">
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
};
export default TextArea;