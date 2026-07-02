export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-gray-600">
            🔔
          </button>
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-accent font-bold">A</span>
          </div>
        </div>
      </div>
    </header>
  );
}