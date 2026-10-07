import {
  parseDocEditorHostMessage,
  readDocEditorPageTheme,
  type DocEditorPageMessage,
} from "@t3tools/client-runtime/docEditor";
import { StrictMode, useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { DocEditor } from "./components/doc-editor/DocEditor";
import "./doc-editor-page.css";

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (message: string) => void };
    __docEditorReceive?: (raw: string) => void;
  }
}

function postToHost(message: DocEditorPageMessage) {
  const raw = JSON.stringify(message);
  if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(raw);
  else if (window.parent !== window) window.parent.postMessage(raw, "*");
}

function applyTheme() {
  const theme = readDocEditorPageTheme(window.location.search);
  const root = document.documentElement.style;
  if (theme.background) root.setProperty("--background", theme.background);
  if (theme.foreground) root.setProperty("--foreground", theme.foreground);
  if (theme.muted) root.setProperty("--muted-foreground", theme.muted);
  if (theme.border) root.setProperty("--border", theme.border);
  if (theme.accent) root.setProperty("--primary", theme.accent);
}

function DocEditorPage() {
  const [doc, setDoc] = useState<{ markdown: string; plain: boolean; revision: number } | null>(
    null,
  );

  useEffect(() => {
    const receive = (raw: unknown) => {
      const message = parseDocEditorHostMessage(raw);
      if (message?.type === "load") {
        setDoc((current) => ({
          markdown: message.markdown,
          plain: message.plain,
          revision: (current?.revision ?? 0) + 1,
        }));
      } else if (message?.type === "setPlain") {
        setDoc((current) => (current ? { ...current, plain: message.plain } : current));
      }
    };
    const onMessage = (event: Event) => receive((event as MessageEvent).data);
    window.__docEditorReceive = receive;
    window.addEventListener("message", onMessage);
    document.addEventListener("message", onMessage);
    postToHost({ type: "ready" });
    return () => {
      delete window.__docEditorReceive;
      window.removeEventListener("message", onMessage);
      document.removeEventListener("message", onMessage);
    };
  }, []);

  const handleChange = useCallback((markdown: string) => {
    setDoc((current) => (current ? { ...current, markdown } : current));
    postToHost({ type: "change", markdown });
  }, []);

  const togglePlain = useCallback(() => {
    setDoc((current) => {
      if (!current) return current;
      postToHost({ type: "plainChanged", plain: !current.plain });
      return { ...current, plain: !current.plain };
    });
  }, []);

  if (!doc) return <div data-doc-page-loading="">Loading…</div>;

  return (
    <div data-doc-page="">
      <button type="button" data-doc-page-toggle="" onClick={togglePlain}>
        {doc.plain ? "Rich text" : "Plain text"}
      </button>
      <DocEditor
        key={doc.revision}
        value={doc.markdown}
        plain={doc.plain}
        onChange={handleChange}
      />
    </div>
  );
}

applyTheme();
const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <StrictMode>
      <DocEditorPage />
    </StrictMode>,
  );
}
