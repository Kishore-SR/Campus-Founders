import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../lib/admin-api";
import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { useThemeStore } from "../store/useThemeStore";
import {
  Users,
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
} from "lucide-react";
import PageLoader from "../components/PageLoader";

const AdminDashboardPage = () => {
  const { theme } = useThemeStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: getDashboardStats,
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-base-100 p-4 sm:p-6 lg:p-8" data-theme={theme}>
      <Helmet>
        <title>Admin Dashboard | Campus Founders</title>
        <meta name="description" content="Admin dashboard for Campus Founders" />
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="badge badge-primary badge-lg">Campus Founders</div>
        </div>

        {/* Platform Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card bg-gradient-to-br from-primary to-primary/70 text-primary-content">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="size-8" />
                  <h3 className="text-3xl font-bold">{stats?.users?.total || 0}</h3>
                </div>
              </div>
              <p className="opacity-90 mt-2">Total Users</p>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-secondary to-secondary/70 text-secondary-content">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Briefcase className="size-8" />
                  <h3 className="text-3xl font-bold">{stats?.startups?.total || 0}</h3>
                </div>
              </div>
              <p className="opacity-90 mt-2">Total Startups</p>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-accent to-accent/70 text-accent-content">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="size-8" />
                  <h3 className="text-3xl font-bold">{stats?.users?.students || 0}</h3>
                </div>
              </div>
              <p className="opacity-90 mt-2">Student Founders</p>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-info to-info/70 text-info-content">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserCheck className="size-8" />
                  <h3 className="text-3xl font-bold">{stats?.users?.investors || 0}</h3>
                </div>
              </div>
              <p className="opacity-90 mt-2">Investors</p>
            </div>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pending Startups */}
          <Link to="/admin/startups?status=pending" className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">Pending Startups</h2>
                <Clock className="size-5 text-warning" />
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl font-bold text-warning">{stats?.startups?.pending || 0}</span>
              </div>
              <p className="text-sm opacity-70 mb-2">Awaiting approval</p>
              <div className="card-actions justify-end mt-2">
                <button className="btn btn-warning btn-sm">Review Now</button>
              </div>
            </div>
          </Link>

          {/* Pending Investors */}
          <Link to="/admin/investors?status=pending" className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">Pending Investors</h2>
                <Clock className="size-5 text-warning" />
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-3xl font-bold text-warning">{stats?.investors?.pending || 0}</span>
              </div>
              <p className="text-sm opacity-70 mb-2">Awaiting verification</p>
              <div className="card-actions justify-end mt-2">
                <button className="btn btn-warning btn-sm">Verify Now</button>
              </div>
            </div>
          </Link>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Startup Status Breakdown */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="text-xl font-bold mb-4">Startup Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="size-5 text-warning" />
                    <span>Pending</span>
                  </div>
                  <div className="badge badge-warning">{stats?.startups?.pending || 0}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="size-5 text-success" />
                    <span>Approved</span>
                  </div>
                  <div className="badge badge-success">{stats?.startups?.approved || 0}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="size-5 text-error" />
                    <span>Rejected</span>
                  </div>
                  <div className="badge badge-error">{stats?.startups?.rejected || 0}</div>
                </div>
              </div>
              <Link to="/admin/startups" className="btn btn-outline btn-sm mt-4">
                View All Startups
              </Link>
            </div>
          </div>

          {/* Investor Status Breakdown */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="text-xl font-bold mb-4">Investor Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="size-5 text-warning" />
                    <span>Pending Verification</span>
                  </div>
                  <div className="badge badge-warning">{stats?.investors?.pending || 0}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="size-5 text-success" />
                    <span>Verified</span>
                  </div>
                  <div className="badge badge-success">{stats?.investors?.approved || 0}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserX className="size-5 text-error" />
                    <span>Rejected</span>
                  </div>
                  <div className="badge badge-error">{stats?.investors?.rejected || 0}</div>
                </div>
              </div>
              <Link to="/admin/investors" className="btn btn-outline btn-sm mt-4">
                View All Investors
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/admin/users" className="btn btn-outline">
                <Users className="size-5 mr-2" />
                Manage Users
              </Link>
              <Link to="/admin/startups" className="btn btn-outline">
                <Briefcase className="size-5 mr-2" />
                Manage Startups
              </Link>
              <Link to="/admin/investors" className="btn btn-outline">
                <UserCheck className="size-5 mr-2" />
                Manage Investors
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

