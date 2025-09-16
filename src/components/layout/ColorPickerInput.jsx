import PropTypes from "prop-types";

const ColorPickerInput = ({
  id,
  name,
  label,
  value = "#000000",
  onChange = () => {},
  showHex = true,
  required = false,
}) => {
  const handleColorChange = (e) => {
    const next = e.target.value;
    onChange(next);
  };

  const handleHexChange = (e) => {
    const v = e.target.value;
    if (/^#?[0-9A-Fa-f]{0,6}$/.test(v)) {
      if (/^#?[0-9A-Fa-f]{6}$/.test(v)) {
        const normalized = v.startsWith("#") ? v : `#${v}`;
        onChange(normalized);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-1 ">
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 pb-1"
        >
          {label}{" "}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

    {/* Input box (styled like TextInput) */}
<div className="flex items-center border border-gray-300 rounded-md px-2 
                focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
  {/* Native color input */}
  <input
    id={id}
    name={name}
    type="color"
    value={value}
    onChange={handleColorChange}
    className="w-full h-10 p-0 border-0 bg-transparent cursor-pointer focus:outline-none"
    aria-label={label || "Color picker"}
  />

  {/* Optional hex field */}
  {/* {showHex && (
    <input
      type="text"
      value={value.toUpperCase()}
      onChange={handleHexChange}
      className="flex-1 text-sm px-2 py-1 border-0 focus:outline-none"
      aria-label="Hex color value"
    />
  )} */}
</div>

    </div>
  );
};

export default ColorPickerInput;

ColorPickerInput.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  showHex: PropTypes.bool,
  required: PropTypes.bool,
};
