import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "antd/dist/reset.css";
import AppRoutes from "./routes";
import { ConfigProvider } from "antd";
import { antdConfig } from "./config/antd.config";
import { Toaster } from "sonner";
import { HelmetProvider } from "react-helmet-async";
import AuthProvider from "./pages/auth/AuthProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <HelmetProvider>
            <ConfigProvider {...antdConfig}>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
                <Toaster
                    position="top-right"
                    expand={false}
                    richColors
                    closeButton
                />
            </ConfigProvider>
        </HelmetProvider>
    </React.StrictMode>,
);
