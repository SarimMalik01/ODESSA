import { useEffect, useState } from "react";
import UploadsBarChart from "./UploadsBarChart";
import IssuesDonutChart from "./IssueDonutChart";
import PROFILE_LOGO from "../../assets/PROFILE_LOGO.png"
type Props = {
  onClose: () => void;
};

export default function ProfileModal({ onClose }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/profile/analytics", {
          credentials: "include",
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Profile fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* MODAL */}
      <div
        className="relative bg-zinc-900 w-[600px] rounded-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-300">
            Loading…
          </div>
        ) : (
          <>
            {/* TOP SECTION */}
            <div className="flex flex-col items-center mb-6">
            <div
  className="
    w-16 h-16
    rounded-full
    overflow-hidden
    bg-white/10
    backdrop-blur
    mb-2
    flex items-center justify-center
  "
>
  <img
    src={PROFILE_LOGO}
    alt="Profile"
    className="w-full h-full object-cover"
  />
</div>

              <p className="text-gray-300">{data.email}</p>
            </div>

            {/* MIDDLE SECTION */}
            <div className="mb-8">
              <h3 className="text-lg mb-2">Uploads by Month</h3>
              <UploadsBarChart uploadsByMonth={data.uploadsByMonth} />
            </div>

            {/* BOTTOM SECTION */}
            <div>
              <h3 className="text-lg mb-2">Issues Distribution</h3>
              <IssuesDonutChart issues={data.issuesByCategory} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
