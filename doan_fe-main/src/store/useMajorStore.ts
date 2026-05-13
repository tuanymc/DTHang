import { create } from "zustand";
import { majorService } from "../services/major.service";

interface MajorState {
  majors: any[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  allMajors: any[];

  getMajors: (params?: any) => Promise<void>;
  createMajor: (data: any) => Promise<void>;
  updateMajor: (data: any) => Promise<void>;
  deleteMajor: (id: string) => Promise<void>;
  getAllMajor: () => Promise<void>;
}

export const useMajorStore = create<MajorState>((set, get) => ({
  majors: [],
  total: 0,
  page: 1,
  pageSize: 10,
  isLoading: false,
  allMajors: [],

  getMajors: async (params) => {
    set({ isLoading: true });

    try {
      const res = await majorService.getMajors({
        search: params?.search || "",
        page: params?.page || get().page,
        pageSize: params?.pageSize || get().pageSize,
      });

      set({
        majors: res.data || [],
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

  createMajor: async (data) => {
    try {
      await majorService.createMajor(data);

      // reload list
      await get().getMajors();
    } catch (err) {
      throw err;
    }
  },

  updateMajor: async (data) => {
    try {
      await majorService.updateMajor(data);

      await get().getMajors();
    } catch (err) {
      throw err;
    }
  },

  deleteMajor: async (id) => {
    try {
      await majorService.deleteMajor({ id });

      await get().getMajors();
    } catch (err) {
      throw err;
    }
  },

  getAllMajor: async () => {
    try {
      const res = await majorService.allMajor();
      
      set({
        allMajors: res.data.result || [],
      });
    } catch (err) {
      console.error(err);
    }
  },
}));