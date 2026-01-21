import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

export default function SharedReportGate() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  console.log(" lOaded the shared gate");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:5000/api/projects/shared/${token}`,
          { credentials: "include" }
        );

        if (res.status === 401) {
          // 🔐 not logged in → redirect to login
          navigate("/login", {
            replace: true,
            state: {
              redirectTo: location.pathname,
            },
          });
          return;
        }

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Access denied");
        }

        const shared = await res.json();
        console.log(" shared : ",shared);
       navigate(`/report/${shared.projectId}`, {
        state: {
          shared: true,
          ownerId: shared.ownerId,
        },
        replace: true,
      });
      
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Access denied");
        }
      } finally {
        setLoading(false);
      }
    };

    verifyAccess();
  }, [token, navigate, location.pathname]);

  if (loading) return <p>Checking access…</p>;
  if (error) return <p>{error}</p>;

  return null;
}
