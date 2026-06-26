function Card({ children }) {
  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 w-96">
      {children}
    </div>
  );
}

export default Card;