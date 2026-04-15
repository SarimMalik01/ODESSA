export function ProjectList({
    projects,
    onSelectProject,
  }: {
    projects: string[];
    onSelectProject: (projectName: string) => void;
  }) {
    return (
      <div className="space-y-2">
        {projects.map((project, i) => (
          <div
            key={i}
            onClick={() => onSelectProject(project)}
            className="p-2 border border-white/10 rounded cursor-pointer hover:border-white/30 text-sm text-white/80"
          >
            {project}
          </div>
        ))}
      </div>
    );
  }