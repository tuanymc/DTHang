import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
    useLocation,
} from "react-router-dom";
import React, { useEffect } from "react";
import { Spin } from "antd";
import AuthPage from "../pages/auth/AuthPage";
import AdminLayout from "../layouts/AdminLayout";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";
import CourseManagement from "../pages/admin/CourseManagement";
import UserManagement from "../pages/admin/UserManagement";
import RoleManagement from "../pages/admin/RoleManagement";
import MajorManagement from "../pages/admin/MajorManagement";
import CategoryManagement from "../pages/admin/CategoryManagement";
import AdminProfile from "../pages/admin/AdminProfile";
import CourseLearningPage from "../pages/LearningPage/CourseLearningPage";
import MyCourses from "../pages/MyCourses";
import LearningPaths from "../pages/LearningPaths";
import CoursesCatalog from "../pages/CoursesCatalog";
import CourseDetail from "../pages/CourseDetail";
import Wishlist from "../pages/Wishlist";
import Profile from "../pages/Profile";
import CourseContentManagement from "../pages/admin/CourseContentManagement";
import { useAuthStore } from "../store/useAuthStore";
import AboutPage from "../pages/AboutPage";
import DashboardPage from "../pages/DashboardPage";
import AuthAdmin from "../pages/auth/AuthAdmin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import CourseContentPage from "../pages/admin/CourseContentPage";
import { hasAdminRole } from "../utils/hasAdminRole";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading, hasFetched } = useAuthStore();
    const location = useLocation();

    if (!hasFetched || isLoading) {
        return <Spin fullscreen />;
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/auth/login"
                state={{ from: location }}
                replace
            />
        );
    }

    return children;
};

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading, hasFetched, user } = useAuthStore();
    const location = useLocation();

    if (!hasFetched || isLoading) {
        return <Spin fullscreen />;
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/auth/admin/login"
                state={{ from: location }}
                replace
            />
        );
    }

    if (!hasAdminRole(user)) {
        return (
            <Navigate
                to="/auth/admin/login"
                state={{ from: location, forbidden: true }}
                replace
            />
        );
    }

    return <>{children}</>;
};

export default function AppRoutes() {
    const { fetchMe } = useAuthStore();

    useEffect(() => {
        fetchMe();
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/auth">
                    <Route path="login" element={<AuthPage />} />
                    <Route path="admin/login" element={<AuthAdmin />} />
                </Route>
                <Route
                    path="/admin"
                    element={
                        <AdminProtectedRoute>
                            <AdminLayout />
                        </AdminProtectedRoute>
                    }
                >
                    <Route
                        index
                        element={<Navigate to="/admin/dashboard" replace />}
                    />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="v1">
                        <Route
                            index
                            element={<Navigate to="courses" replace />}
                        />
                        <Route path="courses" element={<CourseManagement />} />
                        <Route
                            path="user-management"
                            element={<UserManagement />}
                        />
                        <Route path="role-management" element={<RoleManagement />} />
                        <Route path="major-management" element={<MajorManagement />} />
                        <Route path="category-management" element={<CategoryManagement />} />
                        <Route path="profile" element={<AdminProfile />} />
                        <Route path="lesson-management" element={<CourseContentPage />} />
                        <Route path="lesson-detail" element={<CourseContentManagement />} />
                        <Route
                            path="courses/:courseId/contents"
                            element={<CourseContentManagement />}
                        />
                    </Route>
                </Route>

                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/learning-paths" element={<LearningPaths />} />
                    <Route path="/courses" element={<CoursesCatalog />} />

                    <Route
                        path="/my-courses"
                        element={
                            <ProtectedRoute>
                                <MyCourses />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/courses/:course_id" element={<CourseDetail />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/my-courses/wishlist"
                        element={
                            <ProtectedRoute>
                                <Wishlist />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                <Route
                    path="/learning"
                    element={
                        <ProtectedRoute>
                            <CourseLearningPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
