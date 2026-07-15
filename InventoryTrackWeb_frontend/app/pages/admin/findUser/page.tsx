"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Smartphone } from "lucide-react";
import { getUserByPhone, getAdminUser } from "@/lib/api/auth";
import { toast } from "sonner";

export const dynamic = "force-dynamic";

export default function FindUserPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("id"); // "id" or "phone"
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Please enter a search value");
      return;
    }

    setLoading(true);
    try {
      if (searchType === "phone") {
        // Search by phone
        const result = await getUserByPhone(searchQuery);
        const user = result.user || result.data || result;
        if (user && (user.id || user._id)) {
          router.push(`/admin/EditUser/${user.id || user._id}`);
        } else {
          toast.error("User not found");
        }
      } else {
        // Verify ID exists before navigating
        await getAdminUser(searchQuery);
        router.push(`/admin/EditUser/${searchQuery}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 animate-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="h-16 w-16 bg-gradient-to-br from-teal-100 to-teal-50 dark:from-teal-900/30 dark:to-teal-800/20 text-teal-700 dark:text-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Search size={32} />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Find User</h2>
            <p className="text-gray-500 dark:text-gray-400">Search for user by ID or phone number</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-5">
            {/* Search Type Switcher */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
              <button
                type="button"
                onClick={() => setSearchType("id")}
                className={`flex-1 py-2 rounded-md font-medium transition-all ${
                  searchType === "id"
                    ? "bg-white dark:bg-gray-800 text-teal-700 dark:text-teal-500 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => setSearchType("phone")}
                className={`flex-1 py-2 rounded-md font-medium transition-all ${
                  searchType === "phone"
                    ? "bg-white dark:bg-gray-800 text-teal-700 dark:text-teal-500 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                Phone
              </button>
            </div>

            {/* Search Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {searchType === "phone" ? "Phone Number" : "User ID"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {searchType === "phone" ? (
                    <Smartphone size={20} className="text-gray-400 dark:text-gray-600" />
                  ) : (
                    <Search size={20} className="text-gray-400 dark:text-gray-600" />
                  )}
                </div>
                <input
                  type={searchType === "phone" ? "tel" : "text"}
                  placeholder={searchType === "phone" ? "Enter phone number..." : "Enter User ID..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="w-full h-12 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-lg hover:shadow-teal-600/20 transition-all disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>Search User</span>
                </>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 <span className="font-medium">Tip:</span> You can search by user ID or phone number to quickly find and edit user details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
