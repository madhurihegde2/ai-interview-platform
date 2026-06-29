function InputField({
  label,
  type,
  placeholder,
  value,
  onChange,
  name,
}) {
  return (
    <div className="mt-4">
      <label className="block font-medium mb-1">
        {label}
      </label>

      <input
        className="w-full border rounded-lg px-3 py-2
        focus:outline-none focus:ring-2 focus:ring-blue-500"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
      />
    </div>
  );
}

export default InputField;