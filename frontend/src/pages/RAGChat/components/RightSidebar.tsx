type Citation = {
    id: string;
    title: string;
    category: string;
    severity: string;
    file: string;
    description: string;
    importance: number;
  };
  
  export default function RightSidebar({
    citations,
    onClose,
  }: {
    citations: Citation[];
    onClose: () => void;
  }) {
    return (
      <div className="w-full bg-zinc-900 border-l border-white/10 p-4 flex flex-col h-full">
        
        <div className="flex justify-between mb-4">
          <h2 className="text-sm text-white/70">CITATIONS</h2>
          <button onClick={onClose}>✕</button>
        </div>
  
        <div className="space-y-3 overflow-y-auto">
          {citations.map((c) => (
            <div
              key={c.id}
              className="p-3 border border-white/10 rounded bg-black/40"
            >
              <p className="text-white text-sm">{c.title}</p>
  
              <p className="text-xs text-white/40">{c.file}</p>
  
              <span className="text-xs text-blue-400">
                {c.category}
              </span>
  
              <p className="text-xs text-white/50 mt-1">
                {c.description}
              </p>
  
              <p
                className={`text-xs mt-1 ${
                  c.severity === "high"
                    ? "text-red-400"
                    : c.severity === "medium"
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {c.severity}
              </p>
  
              <p className="text-xs text-white/30">
                Score: {c.importance.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }