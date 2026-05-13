import apiClient from "./apiClient.service";

const getCategories = async (params?: any): Promise<any> => {
    try {
        const response = await apiClient.post("/category/list-cate", {
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

const createCategory = async (params?: any): Promise<any> => {
    try {
        const body = {
            name: params.name,
            description: params.description,
        };
        const response = await apiClient.post("/category/create-cate", body);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo danh mục", error);
        throw error;
    }
};

const updateCategory = async (params?: any): Promise<any> => {
    try {
        const body = {
            id: params.id,
            name: params.name,
            description: params.description,
        };

        const response = await apiClient.post("/category/update-cate", body);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật danh mục", error);
        throw error;
    }
};

const deleteCategory = async (params?: any): Promise<any> => {
    try {
        const response = await apiClient.post("/category/delete-cate", {
            id: params.id,
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi xóa danh mục", error);
        throw error;
    }
};

const allCategory = async (): Promise<any> => {
    try {
        const response = await apiClient.post("/category/all-cate");
        return response;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách danh mục", error);
        throw error;
    }
};

export const categoryService = {
    getCategories,
    deleteCategory,
    updateCategory,
    createCategory,
    allCategory,
};
