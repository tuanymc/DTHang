import { create } from "zustand";
import { authService } from "../services/auth.service";

interface AuthState {
    user: any | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    hasFetched: boolean;
    users: any[];
    total: number;
    page: number;
    pageSize: number;
    roles: any[];

    login: (data: { email: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
    fetchMe: () => Promise<void>;
    setUser: (user: any) => void;
    getUsers: (params?: any) => Promise<void>;
    getRoles: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false, // 👈 mặc định true
    hasFetched: false,
    users: [],
    total: 0,
    page: 1,
    pageSize: 10,
    roles: [],

    getUsers: async (params) => {
        // set({ isLoading: true });

        try {
            const res = await authService.getListUser({
                search: params?.search || "",
                role: params?.role || "",
                page: params?.page || get().page,
                pageSize: params?.pageSize || get().pageSize,
            });

            console.log("res");

            // set({
            //   users: res.result.data || [],
            //   total: res.pagination.total || 0,
            //   page: params?.page || 1,
            //   pageSize: params?.pageSize || 10,
            //   isLoading: false,
            // });

            set({
                users: res.result.data || [],
                total: res.result.pagination.total || 0,
                page: res.result.pagination.page || 1,
                pageSize: res.result.pagination.page_size || 10,
                isLoading: false,
            });
        } catch (err) {
            console.error(err);
            set({ isLoading: false });
        }
    },

    setUser: (user) => {
        set({
            user,
            isAuthenticated: !!user,
        });
    },

    login: async (payload) => {
        await authService.login(payload); // set cookie

        const res = await authService.getProfile(); // /auth/me

        set({
            user: res.user,
            isAuthenticated: true,
            isLoading: false,
        });
    },

    fetchMe: async () => {
        try {
            const res = await authService.getProfile();
            console.log("ME:", res);

            set({
                user: res.user,
                isAuthenticated: true,
                isLoading: false,
                hasFetched: true,
            });
        } catch {
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                hasFetched: true,
            });
        }
    },

    logout: async () => {
        try {
            await authService.logout();
        } catch (err) {
            console.warn("Logout API failed:", err);
        }

        set({
            user: null,
            isAuthenticated: false,
        });
    },

    getRoles: async () => {
        try {
            const res = await authService.getListRole();
            console.log(res);

            set({
                roles: res.result || [],
            });
        } catch (err) {
            console.error(err);
        }
    },
}));
