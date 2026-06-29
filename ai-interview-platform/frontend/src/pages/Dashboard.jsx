import Navbar from "../components/Navbar";

function Dashboard() {
  return (
    <>
      <Navbar />

      <div className="max-w-6xl mx-auto mt-10">
        <h1 className="text-4xl font-bold">
          Welcome, Madhuri 👋
        </h1>

        <p className="text-gray-500 mt-2">
          Ready to practice for your next interview?
        </p>

        <div className="grid grid-cols-2 gap-6 mt-10">

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold">
              Resume
            </h2>

            <p className="mt-2">
              Upload your latest resume.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold">
              AI Questions
            </h2>

            <p className="mt-2">
              Generate interview questions.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold">
              Mock Interview
            </h2>

            <p className="mt-2">
              Practice with AI.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold">
              Interview History
            </h2>

            <p className="mt-2">
              View previous sessions.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}

export default Dashboard;