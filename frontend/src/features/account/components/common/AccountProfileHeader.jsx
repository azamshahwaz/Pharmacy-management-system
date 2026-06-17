import { useRef, useState, useMemo } from "react";
import { toast } from "react-toastify";
import {
  Camera,
  ShieldCheck,
  CalendarDays,
  Trash2,
  Upload,
} from "lucide-react";

export default function ProfileHeader({ user, setUser }) {
  const fileInputRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const [uploading, setUploading] = useState(false);

  const randomAvatar = useMemo(
    () => `https://i.pravatar.cc/200?img=${Math.floor(Math.random() * 70) + 1}`,
    []
  );

  // Upload Avatar
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.", {
        theme: "colored",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB.", {
        theme: "colored",
      });
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL ||
          "http://localhost:5000/api/v1"
        }/users/update-profile`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Avatar upload failed");
      }

      setUser(data.user);

      toast.success("Profile photo updated successfully!", {
        theme: "colored",
      });

      setShowMenu(false);
    } catch (error) {
      console.error(error);

      toast.error(
        error.message || "Avatar upload failed",
        {
          theme: "colored",
        }
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Remove Avatar
  const handleRemoveAvatar = async () => {
    try {
      const formData = new FormData();
      formData.append("removeAvatar", "true");

      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL ||
          "http://localhost:5000/api/v1"
        }/users/update-profile`,
        {
          method: "PUT",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove avatar");
      }

      setUser(data.user);

      toast.success("Profile photo removed successfully!", {
        theme: "colored",
      });

      setShowMenu(false);
    } catch (err) {
      console.error(err);

      toast.error(
        err.message || "Failed to remove avatar",
        {
          theme: "colored",
        }
      );
    }
  };

  return (
    <div className="relative overflow-visible rounded-3xl bg-gradient-to-r from-green-700 via-green-600 to-emerald-500 p-8 shadow-lg">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

      <div className="relative flex flex-col md:flex-row md:items-center gap-8">

        {/* Avatar */}
        <div className="relative w-fit">
          <img
            src={user?.avatar || randomAvatar}
            alt="profile"
            className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
          />

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />

          <button
            type="button"
            disabled={uploading}
            onClick={() => setShowMenu((prev) => !prev)}
            className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-white text-green-700 flex items-center justify-center shadow-md hover:scale-105 transition"
          >
            <Camera size={18} />
          </button>

          {showMenu && (
            <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-56 bg-white rounded-2xl shadow-2xl border overflow-hidden z-50">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 transition"
              >
                <Upload size={16} />
                {uploading ? "Uploading..." : "Upload From Device"}
              </button>

              {user?.avatar && (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={handleRemoveAvatar}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition"
                >
                  <Trash2 size={16} />
                  Remove Photo
                </button>
              )}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="text-white flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {user?.name || "Admin User"}
            </h1>

            <span className="bg-white/20 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 w-fit">
              <ShieldCheck size={16} />
              {user?.role || "Admin"}
            </span>
          </div>

          <p className="text-green-100 mt-3 text-sm md:text-base break-all">
            {user?.email || "admin@example.com"}
          </p>

          <div className="flex flex-wrap items-center gap-5 mt-5 text-sm text-green-100">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} />
              <span>
                Joined{" "}
                {user?.createdAt
                  ? user.createdAt.split(" ")[0]
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

