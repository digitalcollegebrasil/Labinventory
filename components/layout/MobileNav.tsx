import React from "react";
import {
  LayoutDashboard,
  Monitor,
  Settings,
  ClipboardList,
} from "lucide-react";

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  return (
    <nav className="fixed md:hidden bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 flex justify-around z-50">
      <button
        onClick={() => setActiveTab("dashboard")}
        className={`p-3 rounded-lg ${
          activeTab === "dashboard"
            ? "text-indigo-600 dark:text-indigo-300"
            : "text-gray-500"
        }`}
      >
        <LayoutDashboard className="w-6 h-6" />
      </button>

      <button
        onClick={() => setActiveTab("inventory")}
        className={`p-3 rounded-lg ${
          activeTab === "inventory"
            ? "text-indigo-600 dark:text-indigo-300"
            : "text-gray-500"
        }`}
      >
        <Monitor className="w-6 h-6" />
      </button>

      <button
        onClick={() => setActiveTab("tasks")}
        className={`p-3 rounded-lg ${
          activeTab === "tasks"
            ? "text-indigo-600 dark:text-indigo-300"
            : "text-gray-500"
        }`}
      >
        <ClipboardList className="w-6 h-6" />
      </button>

      <button
        onClick={() => setActiveTab("settings")}
        className={`p-3 rounded-lg ${
          activeTab === "settings"
            ? "text-indigo-600 dark:text-indigo-300"
            : "text-gray-500"
        }`}
      >
        <Settings className="w-6 h-6" />
      </button>
    </nav>
  );
}
