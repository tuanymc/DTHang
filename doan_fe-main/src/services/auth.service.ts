import apiClient from "./apiClient.service";


const login = async (params?: any): Promise<any> => {
    try {
        const response = await apiClient.post("/auth/login", {
            email: params.email,
            password: params.password
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi login", error);
        throw error;
    }
};

const register = async (params?: any): Promise<any> => {
    try {
        const response = await apiClient.post("/auth/register", params);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi regis", error);
        throw error;
    }
};

const refreshToken = async (): Promise<any> => {
    try {
        const response = await apiClient.post("/auth/refresh", {});
        return response.data;
    } catch (error) {
        console.error("Lỗi khi refresh", error);
        throw error;
    }
};


const logout = async (): Promise<any> => {
    try {
        const response = await apiClient.post("/auth/logout", {});
        return response.data;
    } catch (error) {
        console.error("Lỗi khi logout", error);
        throw error;
    }
};

const getProfile = async (): Promise<any> => {
    try {
        const response = await apiClient.post("/auth/me", {});
        return response.data;
    } catch (error) {
        console.error("Lỗi khi get profile", error);
        throw error;
    }
};

const getListUser = async (params?: any): Promise<any> => {
    try {
        const response = await apiClient.post("/auth/list-user", {
            search: params.search,
            role: params.role,
            page: params.page || 1,
            pageSize: params.pageSize || 10,
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi get list user", error);
        throw error;
    }
};

const getListRole = async (): Promise<any> => {
    try {
        const response = await apiClient.post("/auth/list-role" );
        return response.data;
    } catch (error) {
        console.error("Lỗi khi get list role", error);
        throw error;
    }
};

export const authService = {
    login,
    register,
    refreshToken,
    logout,
    getProfile,
    getListUser,
    getListRole
};
