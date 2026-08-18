function Button({ text, onClick, disabled = false }) {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {text}
    </button>
  );
}

export default Button;