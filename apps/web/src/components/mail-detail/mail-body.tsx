import { useRef, useEffect, useState } from "react";
import DOMPurify from "dompurify";

interface MailBodyProps {
  html?: string;
  text?: string;
}

export function MailBody({ html, text }: MailBodyProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(300);

  useEffect(() => {
    if (!html || !iframeRef.current) return;

    const sanitized = DOMPurify.sanitize(html, {
      ADD_TAGS: ["style"],
      ADD_ATTR: ["target"],
      FORBID_TAGS: ["script", "iframe", "object", "embed", "form"],
    });

    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Geist Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', sans-serif;
              font-size: 14px;
              line-height: 1.7;
              color: #2d2d2d;
              margin: 0;
              padding: 0;
              word-wrap: break-word;
              overflow-wrap: break-word;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            img { max-width: 100%; height: auto; }
            a { color: #333; text-decoration: underline; text-underline-offset: 2px; }
            a:hover { text-decoration: underline; }
            table { max-width: 100%; }
            pre { white-space: pre-wrap; overflow-x: auto; }
            blockquote {
              border-left: 3px solid #dadce0;
              margin: 8px 0;
              padding: 4px 12px;
              color: #5f6368;
            }
          </style>
        </head>
        <body>${sanitized}</body>
      </html>
    `);
    doc.close();

    // Auto-resize
    const resize = () => {
      if (doc.body) {
        setIframeHeight(Math.max(100, doc.body.scrollHeight + 20));
      }
    };

    // Observe for images loading, etc.
    const observer = new MutationObserver(resize);
    observer.observe(doc.body, { childList: true, subtree: true });
    setTimeout(resize, 100);
    setTimeout(resize, 500);

    return () => observer.disconnect();
  }, [html]);

  if (html) {
    return (
      <iframe
        ref={iframeRef}
        className="w-full border-0"
        style={{ height: `${iframeHeight}px` }}
        sandbox="allow-same-origin"
        title="メール本文"
      />
    );
  }

  if (text) {
    return (
      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-foreground/85">
        {text}
      </pre>
    );
  }

  return (
    <p className="text-sm text-muted-foreground italic">本文はありません</p>
  );
}
