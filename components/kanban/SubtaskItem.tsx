import React from "react";
import { Subtask } from "./types";

interface Props {
    subtask: Subtask;
    toggle: (st: Subtask) => void;
    remove: (id: number) => void;
}

export function SubtaskItem({ subtask, toggle, remove }: Props) {
    return (
        <div className="flex items-center gap-3 bg-gray-800 p-2 rounded mb-2">
            <input
                type="checkbox"
                checked={subtask.done}
                onChange={() => toggle(subtask)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
            />

            <span
                className={
                    subtask.done
                        ? "line-through text-gray-500 flex-1"
                        : "text-white flex-1"
                }
            >
                {subtask.title}
            </span>

            <button
                onClick={() => remove(subtask.id)}
                className="text-red-400 hover:text-red-300 ml-auto px-2"
            >
                X
            </button>
        </div>
    );
}
