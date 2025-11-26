import React from "react";

export function PriorityBadge({ priority }: { priority: string }) {
    const classes: Record<string, string> = {
        normal: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        alta: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
        critica: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        urgente: "bg-purple-200 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    };

    const labels: Record<string, string> = {
        normal: "🔵 Normal",
        alta: "🟡 Alta",
        critica: "🔴 Crítica",
        urgente: "💎 Urgente",
    };

    // Default to normal if priority is unknown or empty
    const normalizedPriority = priority || "normal";

    return (
        <span
            className={`px-2 py-1 rounded-lg text-xs font-semibold ${classes[normalizedPriority] || classes.normal}`}
        >
            {labels[normalizedPriority] || labels.normal}
        </span>
    );
}
