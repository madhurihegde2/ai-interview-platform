function Button({ text }) {
  return (
    <button
      className="w-full bg-blue-600 text-white py-2 rounded-lg
      hover:bg-blue-700 transition duration-200"
    >
      {text}
    </button>
  );
}

export default Button;