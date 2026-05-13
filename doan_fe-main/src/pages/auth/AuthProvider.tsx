import { useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Spin } from "antd";

const AuthProvider = ({ children }: any) => {
  const { fetchMe, isLoading } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Đang xác thực..." />
      </div>
    );
  }

  return children;
};

export default AuthProvider;