import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

import { Dashboard } from "../Dashboard";
import { InventoryView } from "../inventory/InventoryView";
import { SettingsLayout } from "../SettingsLayout";
import { TaskManagement } from "../TaskManagement";
import { LoginPage } from "../LoginPage";

export function Layout() {
    const { user, isLoading } = useAuth();

    const [activeTab, setActiveTab] = useState<
        "dashboard" | "inventory" | "settings" | "tasks"
    >("dashboard");

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!user) return <LoginPage />;

    return (
        <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 md:ml-64 p-6 transition-all duration-200">
                {activeTab === "dashboard" && <Dashboard />}
                {activeTab === "inventory" && <InventoryView />}
                {activeTab === "settings" && <SettingsLayout />}
                {activeTab === "tasks" && <TaskManagement />}
            </main>

            <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    );
}
