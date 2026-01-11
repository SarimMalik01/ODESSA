import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Project = {
  _id: string;
  name: string;
  createdAt: string;
  status: string;
};

export default function MyProjects() {
  const [grouped, setGrouped] = useState<Record<string, Project[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/projects", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((projects: Project[]) => {
        const groupedByMonth: Record<string, Project[]> = {};

        projects.forEach((p) => {
          const date = new Date(p.createdAt);
          const monthKey = date.toLocaleString("default", {
            month: "long",
            year: "numeric",
          });

          groupedByMonth[monthKey] ||= [];
          groupedByMonth[monthKey].push(p);
        });

        // expand most recent month
        const months = Object.keys(groupedByMonth);
        const initialExpanded: Record<string, boolean> = {};
        months.forEach((m, i) => {
          initialExpanded[m] = i === 0;
        });

        setGrouped(groupedByMonth);
        setExpanded(initialExpanded);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleViewProject = (project: Project) => {
    if (project.status !== "COMPLETED") return;
    navigate(`/report/${project._id}`);
  };

  const toggleMonth = (month: string) => {
    setExpanded((prev) => ({
      ...prev,
      [month]: !prev[month],
    }));
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white/5 p-6 text-white/60">
        Loading projects…
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/5 p-6">
      <h2 className="text-lg font-semibold mb-6">
        My Projects
      </h2>

      {Object.keys(grouped).length === 0 && (
        <p className="text-white/50">No projects yet</p>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([month, projects]) => {
          const isOpen = expanded[month];

          return (
            <div key={month}>
              {/* Month Header */}
              <button
                onClick={() => toggleMonth(month)}
                className="
                  flex items-center gap-2
                  text-sm font-medium
                  text-white/70
                  hover:text-white
                  transition
                "
              >
                <span
                  className={`transition-transform ${
                    isOpen ? "rotate-90" : ""
                  }`}
                >
                  ▶
                </span>
                {month}
              </button>

              {/* Projects */}
              {isOpen && (
                <div className="mt-3 space-y-3 pl-5">
                  {projects.map((project) => (
                  <div
                  key={project._id}
                  className={`
                    flex items-center justify-between
                    rounded-xl
                    px-4 py-3
                    border border-white/10
                    transition
                    ${
                      project.status !== "COMPLETED" && project.status !== "FAILED"
                        ? "bg-black/50 opacity-40"
                        : "bg-black/30 hover:border-white/20"
                    }
                  `}
                >
                
                      {/* Project Info */}
                      <div>
                        <div className="font-medium text-white">
                          {project.name}
                        </div>
                        <div className="text-xs text-white/50">
                          Created on{" "}
                          {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Status + Action */}
                      <div className="flex items-center gap-3">
                        {/* Status Tag */}
                        <span
                          className={`
                            px-2.5 py-1
                            rounded-full
                            text-xs font-medium
                            ${
                              project.status === "COMPLETED"
                                ? "bg-green-500/20 text-green-400"
                                : project.status === "FAILED"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }
                          `}
                        >
                          {project.status}
                        </span>

                        {/* View Button */}
                        <button
                          onClick={() => handleViewProject(project)}
                          disabled={project.status !== "COMPLETED"}
                          className={`
                            px-4 py-1.5
                            rounded-md
                            text-sm font-medium
                            transition
                            ${
                              project.status === "COMPLETED"
                                ? "bg-blue-600/90 hover:bg-blue-500"
                                : "bg-gray-600/40 cursor-not-allowed opacity-50"
                            }
                          `}
                        >
                          View Project
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
