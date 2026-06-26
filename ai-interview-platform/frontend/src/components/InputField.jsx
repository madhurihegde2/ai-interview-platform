function InputField({ label, type, placeholder }) {
  return (
    <div className="mt-4">
      <label className="block font-medium mb-1">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="w-full border rounded-lg px-3 py-2
        focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default InputField;