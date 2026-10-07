import { describe, expect, it } from "vite-plus/test";
import {
  docEditorPageUrl,
  isDocEditablePath,
  isPlainTextDocPath,
  newDocContents,
  newDocRelativePath,
  parseDocEditorHostMessage,
  parseDocEditorPageMessage,
  readDocEditorPageTheme,
} from "./docEditor.ts";

describe("docEditor", () => {
  it("round-trips the page theme through the URL", () => {
    const theme = {
      background: "#1d2021",
      foreground: "#ebdbb2",
      muted: "#a89984",
      border: "#504945",
      accent: "#fe8019",
    };
    const url = new URL(docEditorPageUrl("http://100.101.14.98:3773/", theme));
    expect(url.pathname).toBe("/doc-editor.html");
    expect(readDocEditorPageTheme(url.search)).toEqual(theme);
  });

  it("drops theme values that could inject CSS", () => {
    expect(readDocEditorPageTheme("?background=red;}body{display:none")).toEqual({});
  });

  it("classifies editable and plain text paths", () => {
    expect(isDocEditablePath("notes/idea.md")).toBe(true);
    expect(isDocEditablePath("todo.TXT")).toBe(true);
    expect(isDocEditablePath("src/app.ts")).toBe(false);
    expect(isPlainTextDocPath("todo.txt")).toBe(true);
    expect(isPlainTextDocPath("notes/idea.md")).toBe(false);
  });

  it("rejects malformed bridge messages", () => {
    expect(parseDocEditorHostMessage("not json")).toBeNull();
    expect(parseDocEditorHostMessage(JSON.stringify({ type: "load" }))).toBeNull();
    expect(parseDocEditorPageMessage(JSON.stringify({ type: "change", markdown: 1 }))).toBeNull();
    expect(
      parseDocEditorHostMessage(JSON.stringify({ type: "load", markdown: "# Hi", plain: true })),
    ).toEqual({ type: "load", markdown: "# Hi", plain: true });
  });

  it("normalizes new document paths", () => {
    expect(newDocRelativePath(" notes/idea ")).toBe("notes/idea.md");
    expect(newDocRelativePath("./todo.txt")).toBe("todo.txt");
    expect(newDocRelativePath("a//b\\c.md")).toBe("a/b/c.md");
    expect(newDocRelativePath("../escape")).toBeNull();
    expect(newDocRelativePath("folder/")).toBeNull();
    expect(newDocRelativePath("   ")).toBeNull();
  });

  it("seeds markdown documents with a title", () => {
    expect(newDocContents("notes/project-ideas.md")).toBe("# project ideas\n\n");
    expect(newDocContents("todo.txt")).toBe("");
  });
});
