import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ---------- Types ---------- */

type Recipient = {
  userId: string;
  email: string;
  accessedAt?: string;
};

type Owner = {
  userId: string;
  email: string;
};

type Project = {
  _id: string;
  name: string;
  createdAt: string;
  recipients?: Recipient[]; // shared by me
  owner?: Owner;            // shared with me
};

/* ---------- Component ---------- */

export default function Sharedprojects() {
  const [sharedByMe, setSharedByMe] = useState<Project[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<Project[]>([]);

  const [openByMe, setOpenByMe] = useState(true);
  const [openWithMe, setOpenWithMe] = useState(true);
  
  const navigate = useNavigate();

  /* ---------- Fetch shared projects ---------- */
 
  useEffect(() => {
    async function fetchSharedProjects() {
      try {
        const res = await fetch(
          "http://localhost:5000/api/projects/shared",
          { credentials: "include" }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch shared projects");
        }

        const data = await res.json();
        setSharedByMe(data.sharedByMe || []);
        setSharedWithMe(data.sharedWithMe || []);
      } catch (err) {
        console.error("Error fetching shared projects:", err);
      }
    }

    fetchSharedProjects();
  }, []);

  /* ---------- Navigation ---------- */

  const handleViewProject = (projectId: string, owner?: Owner) => {
    if (owner) {
      // shared-with-me
      navigate(`/report/${projectId}`, {
        state: {
          shared: true,
          ownerId: owner.userId,
        },
      });
    } else {
      // shared-by-me (owner view)
      navigate(`/report/${projectId}`);
    }
  };

  /* ---------- UI ---------- */

  return (
    <div className="rounded-2xl bg-white/5 p-6">
      <h2 className="text-lg mb-4">Shared Projects</h2>

      {/* ===================== Projects shared by me ===================== */}
      <div className="mb-6">
        <button
          onClick={() => setOpenByMe(!openByMe)}
          className="flex items-center gap-2 text-sm text-white/80 mb-3"
        >
          {openByMe ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          Projects shared by me
        </button>

        {openByMe && (
          <div className="flex flex-col gap-3">
            {sharedByMe.map((p) => {
              console.log(" p, :",p);
              // 🔥 filter out owner from recipients
              const visibleRecipients =
                p.recipients?.filter(
                  (r) => r.userId !== p.owner?.userId
                ) || [];

              return (
                <div
                  key={p._id}
                  className="
                    flex items-start justify-between
                    rounded-xl bg-black/30
                    p-4 border border-white/10
                  "
                >
                  <div className="pr-4">
                    <h3 className="font-medium">{p.name}</h3>
                    <p className="text-xs text-white/50 mt-1">
                      {new Date(p.createdAt).toDateString()}
                    </p>

                    {/* Recipients */}
                    {visibleRecipients.length > 0 && (
                      <div className="mt-2 text-xs text-white/40">
                        Shared with:
                        <ul className="mt-1 space-y-0.5">
                          {visibleRecipients.map((r) => (
                            <li key={r.userId} className="truncate">
                              • {r.email}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleViewProject(p._id)}
                    className="
                      px-4 py-1.5
                      rounded-md
                      bg-blue-600/90
                      hover:bg-blue-500
                      text-sm font-medium
                      transition
                    "
                  >
                    View Project
                  </button>
                </div>
              );
            })}

            {sharedByMe.length === 0 && (
              <p className="text-white/50">No projects</p>
            )}
          </div>
        )}
      </div>

      {/* ===================== Projects shared with me ===================== */}
      <div>
        <button
          onClick={() => setOpenWithMe(!openWithMe)}
          className="flex items-center gap-2 text-sm text-white/80 mb-3"
        >
          {openWithMe ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
          Projects shared with me
        </button>

        {openWithMe && (
          <div className="flex flex-col gap-3">
            {sharedWithMe.map((p) => (
              <div
                key={p._id}
                className="
                  flex items-start justify-between
                  rounded-xl bg-black/30
                  p-4 border border-white/10
                "
              >
                <div className="pr-4">
                  <h3 className="font-medium">{p.name}</h3>
                  <p className="text-xs text-white/50 mt-1">
                    {new Date(p.createdAt).toDateString()}
                  </p>

                  {/* Owner */}
                  {p.owner && (
                    <div className="mt-2 text-xs text-white/40">
                      Owner:
                      <div className="mt-1 truncate">
                        {p.owner.email}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleViewProject(p._id, p.owner)}
                  className="
                    px-4 py-1.5
                    rounded-md
                    bg-blue-600/90
                    hover:bg-blue-500
                    text-sm font-medium
                    transition
                  "
                >
                  View Project
                </button>
              </div>
            ))}

            {sharedWithMe.length === 0 && (
              <p className="text-white/50">No projects</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
