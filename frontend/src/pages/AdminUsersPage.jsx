import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsers, deleteUser } from "../lib/admin-api";
import { Helmet } from "react-helmet-async";
import { useThemeStore } from "../store/useThemeStore";
import { Users, Search, Filter, Shield, Briefcase, GraduationCap, User, Trash2 } from "lucide-react";
import PageLoader from "../components/PageLoader";
import toast from "react-hot-toast";

const AdminUsersPage = () => {
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null,
    userName: "",
    password: "",
  });

  const { data: response, isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: getAllUsers,
  });

  const deleteUserMutation = useMutation({
    mutationFn: ({ userId, password }) => deleteUser(userId, password),
    onSuccess: () => {
      toast.success("User and all related data deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setDeleteModal({ isOpen: false, userId: null, userName: "", password: "" });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
      if (error.response?.status !== 401) {
        setDeleteModal({ isOpen: false, userId: null, userName: "", password: "" });
      }
    },
  });

  const handleDeleteClick = (user) => {
    setDeleteModal({
      isOpen: true,
      userId: user._id,
      userName: user.fullName || user.username,
      password: "",
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteModal.password) {
      toast.error("Please enter the password");
      return;
    }
    deleteUserMutation.mutate({
      userId: deleteModal.userId,
      password: deleteModal.password,
    });
  };

  if (isLoading) return <PageLoader />;

  const users = response?.users || [];
  const counts = response?.counts || {};

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = !roleFilter || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Stats - use counts from API or calculate from users array
  const stats = {
    total: counts.total || users.length || 0,
    students: counts.students || users.filter((u) => u.role === "student").length || 0,
    investors: counts.investors || users.filter((u) => u.role === "investor").length || 0,
    normal: counts.normal || users.filter((u) => u.role === "normal").length || 0,
    admin: users.filter((u) => u.role === "admin").length || 0,
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "student":
        return <GraduationCap className="size-4" />;
      case "investor":
        return <Briefcase className="size-4" />;
      case "admin":
        return <Shield className="size-4" />;
      default:
        return <User className="size-4" />;
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      student: "badge-accent",
      investor: "badge-info",
      admin: "badge-error",
      normal: "badge-ghost",
    };
    return badges[role] || "badge-ghost";
  };

  return (
    <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8" data-theme={theme}>
      <Helmet>
        <title>Manage Users | Admin</title>
        <meta name="description" content="Manage all platform users" />
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Platform Users</h1>
          <div className="badge badge-primary badge-lg">{stats.total} total users</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card bg-base-200">
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="size-8 text-accent flex-shrink-0" />
                <div>
                  <div className="text-2xl font-bold">{stats.students}</div>
                  <div className="text-xs opacity-70">Students</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-200">
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <Briefcase className="size-8 text-info flex-shrink-0" />
                <div>
                  <div className="text-2xl font-bold">{stats.investors}</div>
                  <div className="text-xs opacity-70">Investors</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-200">
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <User className="size-8 text-primary flex-shrink-0" />
                <div>
                  <div className="text-2xl font-bold">{stats.normal}</div>
                  <div className="text-xs opacity-70">Normal</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-200">
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <Shield className="size-8 text-error flex-shrink-0" />
                <div>
                  <div className="text-2xl font-bold">{stats.admin}</div>
                  <div className="text-xs opacity-70">Admins</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="card bg-base-200">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="form-control flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 opacity-50" />
                  <input
                    type="text"
                    placeholder="Search by name, username, or email..."
                    className="input input-bordered w-full pl-10 placeholder:opacity-40"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div className="form-control md:w-48">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 opacity-50 pointer-events-none" />
                  <select
                    className="select select-bordered w-full pl-10"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="">All Roles</option>
                    <option value="student">Students</option>
                    <option value="investor">Investors</option>
                    <option value="normal">Normal</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="text-sm opacity-70 mt-2">
              Showing {filteredUsers.length || 0} of {stats.total} users
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card bg-base-200">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center opacity-70">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1 overflow-hidden">
                                {user.profilePic && user.profilePic.trim() ? (
                                  <img
                                    src={user.profilePic}
                                    alt={user.fullName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm w-full h-full">
                                    {user.fullName?.charAt(0) || user.username?.charAt(0) || "U"}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold">{user.fullName}</div>
                              <div className="text-sm opacity-70">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-sm">{user.email}</td>
                        <td>
                          <div className={`badge ${getRoleBadge(user.role)} gap-2`}>
                            {getRoleIcon(user.role)}
                            {user.role}
                          </div>
                        </td>
                        <td className="text-sm">{user.location || "-"}</td>
                        <td>
                          {user.role === "investor" ? (
                            <div
                              className={`badge badge-sm ${user.investorApprovalStatus === "approved"
                                ? "badge-success"
                                : user.investorApprovalStatus === "rejected"
                                  ? "badge-error"
                                  : "badge-warning"
                                }`}
                            >
                              {user.investorApprovalStatus || "pending"}
                            </div>
                          ) : (
                            <div className="badge badge-sm badge-ghost">
                              Active
                            </div>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="btn btn-error btn-sm btn-outline"
                            title="Delete user"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete User Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Delete User</h3>
              <p className="mb-4">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold">{deleteModal.userName}</span>?
              </p>
              <p className="text-sm text-error mb-4">
                This will remove the user and all their data including startups,
                investments, reviews, and connections. This action cannot be undone.
              </p>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Enter password to confirm:</span>
                </label>
                <input
                  type="password"
                  placeholder="Password"
                  className="input input-bordered"
                  value={deleteModal.password}
                  onChange={(e) =>
                    setDeleteModal({ ...deleteModal, password: e.target.value })
                  }
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleDeleteConfirm();
                    }
                  }}
                />
              </div>
              <div className="modal-action">
                <button
                  className="btn"
                  onClick={() =>
                    setDeleteModal({
                      isOpen: false,
                      userId: null,
                      userName: "",
                      password: "",
                    })
                  }
                  disabled={deleteUserMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-error"
                  onClick={handleDeleteConfirm}
                  disabled={deleteUserMutation.isPending}
                >
                  {deleteUserMutation.isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Remove"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;

