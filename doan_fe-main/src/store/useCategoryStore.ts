import { create } from "zustand";
import { categoryService } from "../services/category.service";

interface CategoryState {
  categories: any[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  allCategories: any[];

  getCategories: (params?: any) => Promise<void>;
  createCategory: (data: any) => Promise<void>;
  updateCategory: (data: any) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getAllCategory: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  total: 0,
  page: 1,
  pageSize: 10,
  isLoading: false,
  allCategories: [],

  getCategories: async (params) => {
    set({ isLoading: true });

    try {
      const res = await categoryService.getCategories({
        search: params?.search || "",
        page: params?.page || get().page,
        pageSize: params?.pageSize || get().pageSize,
      });

      set({
        categories: res.data || [],
        total: res.total || 0,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10,
        isLoading: false,
      });
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },

  createCategory: async (data) => {
    try {
      await categoryService.createCategory(data);

      // reload list
      await get().getCategories();
    } catch (err) {
      throw err;
    }
  },

  updateCategory: async (data) => {
    try {
      await categoryService.updateCategory(data);

      await get().getCategories();
    } catch (err) {
      throw err;
    }
  },

  deleteCategory: async (id) => {
    try {
      await categoryService.deleteCategory({ id });

      await get().getCategories();
    } catch (err) {
      throw err;
    }
  },

  getAllCategory: async () => {
    try {
      const res = await categoryService.allCategory();
      console.log(res);
      
      set({
        allCategories: res.data.result || [],
      });
    } catch (err) {
      console.error(err);
    }
  },
}));