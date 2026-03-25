"use client";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser ? "rounded-br-md" : "rounded-bl-md"}`}
        style={{
          background: isUser
            ? "var(--user-bubble)"
            : "var(--assistant-bubble)",
          color: isUser ? "var(--user-text)" : "var(--assistant-text)",
        }}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose max-w-none">
            <ReactMarkdown
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeString = String(children).replace(/\n$/, "");

                  if (match) {
                    return (
                      <div className="relative group">
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(codeString)
                          }
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 px-2 py-1 rounded text-xs transition-opacity"
                          style={{
                            background: "var(--border)",
                            color: "var(--foreground)",
                          }}
                        >
                          Copy
                        </button>
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }

                  return (
                    <code
                      className={`${className} px-1.5 py-0.5 rounded text-sm`}
                      style={{ background: "var(--code-bg)", color: "#e5e7eb" }}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
