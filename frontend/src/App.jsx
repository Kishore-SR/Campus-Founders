import React, { lazy, Suspense } from "react"; // ADDED lazy and Suspense for better user-experience
import { Navigate, Route, Routes } from "react-router";
import { HelmetProvider } from "react-helmet-async";

import { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.jsx";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";
import FriendsPage from "./pages/FriendsPage.jsx";
import DefaultMeta from "./components/DefaultMeta.jsx";
import AIChatbot from "./components/AIChatbot.jsx";

const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const SignUpPage = lazy(() => import("./pages/SignupPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage.jsx"));
const CallPage = lazy(() => import("./pages/CallPage.jsx"));
const ChatPage = lazy(() => import("./pages/ChatPage.jsx"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage.jsx"));
const VerifyOTPPage = lazy(() => import("./pages/VerifyOTPPage.jsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.jsx"));
const StartupsPage = lazy(() => import("./pages/StartupsPage.jsx"));
const StartupDetailPage = lazy(() => import("./pages/StartupDetailPage.jsx"));
const InvestorsPage = lazy(() => import("./pages/InvestorsPage.jsx"));
const AdminLoginPage = lazy(() => import("./pages/AdminLoginPage.jsx"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage.jsx"));
const AdminStartupsPage = lazy(() => import("./pages/AdminStartupsPage.jsx"));
const AdminInvestorsPage = lazy(() => import("./pages/AdminInvestorsPage.jsx"));
const AdminUsersPage = lazy(() => import("./pages/AdminUsersPage.jsx"));
const GovtSchemesPage = lazy(() => import("./pages/GovtSchemesPage.jsx"));
const LandingPage = lazy(() => import("./pages/LandingPage.jsx"));
const PremiumPage = lazy(() => import("./pages/PremiumPage.jsx"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage.jsx"));
const CourseDetailPage = lazy(() => import("./pages/CourseDetailPage.jsx"));
const LessonPage = lazy(() => import("./pages/LessonPage.jsx"));

const App = () => {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  // If the initial authUser data is still loading, show loading spinner
  if (isLoading) return <PageLoader />;

  return (
    <HelmetProvider>
      <div className="h-screen" data-theme={theme}>
        <DefaultMeta />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Landing Page - Public */}
            <Route
              path="/"
              element={
                !isAuthenticated ? (
                  <LandingPage />
                ) : isOnboarded ? (
                  <Navigate to="/home" replace />
                ) : (
                  <Navigate to="/onboarding" replace />
                )
              }
            />

            {/* Home Page - Authenticated */}
            <Route
              path="/home"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <HomePage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} replace />
                )
              }
            />
            <Route
              path="/signup"
              element={
                !isAuthenticated ? (
                  <SignUpPage />
                ) : (
                  <Navigate to={isOnboarded ? "/home" : "/onboarding"} replace />
                )
              }
            />
            <Route
              path="/login"
              element={
                !isAuthenticated ? (
                  <LoginPage />
                ) : (
                  <Navigate to={isOnboarded ? "/home" : "/onboarding"} replace />
                )
              }
            />
            <Route
              path="/notifications"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <NotificationsPage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                )
              }
            />

            <Route
              path="/connections"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <FriendsPage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                )
              }
            />
            <Route
              path="/call/:id"
              element={
                isAuthenticated && isOnboarded ? (
                  <CallPage />
                ) : (
                  <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                )
              }
            />

            <Route
              path="/chat/:id"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={false}>
                    <ChatPage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                )
              }
            />

            <Route
              path="/onboarding"
              element={
                isAuthenticated ? (
                  !isOnboarded ? (
                    <OnboardingPage />
                  ) : (
                    <Navigate to="/home" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />

            {/* Profile Page */}
            <Route
              path="/profile"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <ProfilePage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                )
              }
            />

            {/* Startups Page */}
            <Route
              path="/startups"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <StartupsPage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                )
              }
            />

            {/* Startup Detail Page */}
            <Route
              path="/startups/:id"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <StartupDetailPage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                )
              }
            />

            {/* Investors Page */}
            <Route
              path="/investors"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <InvestorsPage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                )
              }
            />

            {/* Government Schemes Page - Only for Founders */}
            <Route
              path="/govt-schemes"
              element={
                isAuthenticated && isOnboarded && authUser?.role === "student" ? (
                  <Layout showSidebar={true}>
                    <GovtSchemesPage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                )
              }
            />

            {/* Premium Page */}
            <Route
              path="/premium"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <PremiumPage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                )
              }
            />

            {/* Resources Page */}
            <Route
              path="/resources"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <ResourcesPage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                )
              }
            />

            {/* Course Detail Page */}
            <Route
              path="/resources/:courseId"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <CourseDetailPage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                )
              }
            />

            {/* Lesson Page */}
            <Route
              path="/resources/:courseId/lesson/:lessonId"
              element={
                isAuthenticated && isOnboarded ? (
                  <Layout showSidebar={true}>
                    <LessonPage />
                  </Layout>
                ) : (
                  <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
                )
              }
            />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin/dashboard"
              element={
                <Layout showSidebar={false}>
                  <AdminDashboardPage />
                </Layout>
              }
            />
            <Route
              path="/admin/users"
              element={
                <Layout showSidebar={false}>
                  <AdminUsersPage />
                </Layout>
              }
            />
            <Route
              path="/admin/startups"
              element={
                <Layout showSidebar={false}>
                  <AdminStartupsPage />
                </Layout>
              }
            />
            <Route
              path="/admin/investors"
              element={
                <Layout showSidebar={false}>
                  <AdminInvestorsPage />
                </Layout>
              }
            />
          </Routes>
        </Suspense>

        {/* AI Chatbot - Available on all pages */}
        {isAuthenticated && isOnboarded && <AIChatbot />}

        <Toaster />
      </div>
    </HelmetProvider>
  );
};

export default App;
