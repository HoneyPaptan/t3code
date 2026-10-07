import {
  type DocEditorHostMessage,
  docEditorPageUrl,
  isPlainTextDocPath,
  parseDocEditorPageMessage,
} from "@t3tools/client-runtime/docEditor";
import { squashAtomCommandFailure } from "@t3tools/client-runtime/state/runtime";
import type { EnvironmentId } from "@t3tools/contracts";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { useUniwindTheme } from "../../lib/useUniwindTheme";
import { projectEnvironment } from "../../state/projects";
import { usePreparedConnection } from "../../state/session";
import { useAtomCommand } from "../../state/use-atom-command";
import { FilePreviewLoading, FilePreviewNotice } from "./FilePreviewFeedback";

const SAVE_DELAY_MS = 600;

export function DocEditorSurface(props: {
  readonly environmentId: EnvironmentId;
  readonly cwd: string;
  readonly relativePath: string;
  readonly initialContents: string;
  readonly onSaved: () => void;
}) {
  const theme = useUniwindTheme();
  const connection = usePreparedConnection(props.environmentId);
  const httpBaseUrl = connection._tag === "Some" ? connection.value.httpBaseUrl : null;
  const writeFile = useAtomCommand(projectEnvironment.writeFile, { reportFailure: false });
  const webView = useRef<WebView<object>>(null);
  const initialContents = useRef(props.initialContents);
  const pending = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const uri = useMemo(
    () =>
      httpBaseUrl === null
        ? null
        : docEditorPageUrl(httpBaseUrl, {
            background: theme["--color-sheet-solid"],
            foreground: theme["--color-foreground"],
            muted: theme["--color-foreground-muted"],
            border: theme["--color-border"],
            accent: theme["--color-primary-text"],
          }),
    [httpBaseUrl, theme],
  );

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const contents = pending.current;
    if (contents === null) return;
    pending.current = null;
    const result = await writeFile({
      environmentId: props.environmentId,
      input: { cwd: props.cwd, relativePath: props.relativePath, contents },
    });
    if (result._tag === "Success") {
      setSaveError(null);
      props.onSaved();
      return;
    }
    const error = squashAtomCommandFailure(result);
    setSaveError(error instanceof Error ? error.message : "Changes were not saved.");
  }, [props, writeFile]);

  const flushRef = useRef(flush);
  useEffect(() => {
    flushRef.current = flush;
  });
  useEffect(() => () => void flushRef.current(), []);

  const send = (message: DocEditorHostMessage) => {
    webView.current?.injectJavaScript(
      `window.__docEditorReceive?.(${JSON.stringify(JSON.stringify(message))}); true;`,
    );
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    const message = parseDocEditorPageMessage(event.nativeEvent.data);
    if (message?.type === "ready") {
      send({
        type: "load",
        markdown: initialContents.current,
        plain: isPlainTextDocPath(props.relativePath),
      });
    } else if (message?.type === "change") {
      pending.current = message.markdown;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), SAVE_DELAY_MS);
    }
  };

  if (uri === null) return <FilePreviewLoading message="Opening editor..." />;

  return (
    <View className="flex-1 bg-sheet">
      {saveError ? <FilePreviewNotice title="Not saved">{saveError}</FilePreviewNotice> : null}
      <WebView
        ref={webView}
        source={{ uri }}
        originWhitelist={["*"]}
        onMessage={handleMessage}
        keyboardDisplayRequiresUserAction={false}
        hideKeyboardAccessoryView
        className="flex-1 bg-sheet"
      />
    </View>
  );
}
