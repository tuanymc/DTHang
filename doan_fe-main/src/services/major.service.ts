import apiClient from "./apiClient.service";

const getMajors = async (params?: any): Promise<any> => {
    try {
        const response = await apiClient.post("/major/list-major", {
            search: params.search,
            page: params.page || 1,
            pageSize: params.pageSize || 10,
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách", error);
        throw error;
    }
};

const createMajor = async (params?: any): Promise<any> => {
    try {
        const body = {
            name: params.name,
            description: params.description,
        };
        const response = await apiClient.post("/major/create-major", body);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo chuyên ngành", error);
        throw error;
    }
};

const updateMajor = async (params?: any): Promise<any> => {
    try {
        const body = {
            id: params.id,
            name: params.name,
            description: params.description,
        };

        const response = await apiClient.post("/major/update-major", body);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật chuyên ngành", error);
        throw error;
    }
};

const deleteMajor = async (params?: any): Promise<any> => {
    try {

        const response = await apiClient.post("/major/delete-major", {id: params.id});
        return response.data;
    } catch (error) {
        console.error("Lỗi khi xóa chuyên ngành", error);
        throw error;
    }
};

const allMajor = async (): Promise<any> => {
    try {

        const response = await apiClient.post("/major/all-major");
        return response;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách chuyên ngành", error);
        throw error;
    }
};

export const majorService = {
    getMajors,
    deleteMajor,
    updateMajor,
    createMajor,
    allMajor
};
