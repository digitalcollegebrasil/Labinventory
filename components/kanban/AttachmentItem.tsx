import React from "react";
import { Attachment } from "./types";

export function AttachmentItem({ a }: { a: Attachment }) {
    return (
        <a
            href={a.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 block hover:underline text-sm p-2 bg-gray-800 rounded mb-1 flex items-center gap-2"
        >
            <span>📎</span>
            <span className="truncate">{a.file_name}</span>
        </a>
    );
}
