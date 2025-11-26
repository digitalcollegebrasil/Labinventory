import React from "react";
import { Comment } from "./types";

export function CommentItem({ c }: { c: Comment }) {
    return (
        <div className="bg-gray-800 p-3 rounded mb-2">
            <div className="flex items-center gap-2 mb-1">
                {c.users?.avatar ? (
                    <img src={c.users.avatar} alt={c.users.name} className="w-5 h-5 rounded-full" />
                ) : (
                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-xs text-white">
                        {c.users?.name?.charAt(0) || '?'}
                    </div>
                )}
                <strong className="text-sm text-gray-300">{c.users?.name ?? "Usuário"}</strong>
            </div>
            <p className="text-gray-100 text-sm">{c.content}</p>
        </div>
    );
}
