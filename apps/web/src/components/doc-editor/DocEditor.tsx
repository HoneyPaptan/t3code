import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";

import "./doc-editor.css";

export interface DocEditorProps {
  value: string;
  onChange?: (markdown: string) => void;
  plain?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

const DOC_EXTENSIONS = (placeholder: string) => [
  StarterKit.configure({ link: { openOnClick: false } }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Markdown,
  Placeholder.configure({ placeholder }),
];

function RichDocBody(props: Omit<DocEditorProps, "plain">) {
  const lastMarkdown = useRef(props.value);
  const onChange = useRef(props.onChange);
  useEffect(() => {
    onChange.current = props.onChange;
  });

  const editor = useEditor({
    extensions: DOC_EXTENSIONS(props.placeholder ?? "Start writing"),
    content: props.value,
    contentType: "markdown",
    editable: !props.readOnly,
    autofocus: props.autoFocus ? "end" : false,
    immediatelyRender: true,
    editorProps: { attributes: { "data-doc-editor-prose": "", spellcheck: "true" } },
    onUpdate: ({ editor: current }) => {
      const markdown = current.getMarkdown();
      lastMarkdown.current = markdown;
      onChange.current?.(markdown);
    },
  });

  useEffect(() => {
    if (!editor || props.value === lastMarkdown.current) return;
    lastMarkdown.current = props.value;
    editor.commands.setContent(props.value, { contentType: "markdown", emitUpdate: false });
  }, [editor, props.value]);

  useEffect(() => {
    editor?.setEditable(!props.readOnly);
  }, [editor, props.readOnly]);

  return <EditorContent editor={editor} data-doc-editor-body="" />;
}

function PlainDocBody(props: Omit<DocEditorProps, "plain">) {
  return (
    <textarea
      data-doc-editor-plain=""
      value={props.value}
      readOnly={props.readOnly}
      autoFocus={props.autoFocus}
      placeholder={props.placeholder ?? "Start writing"}
      spellCheck
      onChange={(event) => props.onChange?.(event.target.value)}
    />
  );
}

export function DocEditor({ plain, ...props }: DocEditorProps) {
  return (
    <div data-doc-editor="" data-mode={plain ? "plain" : "rich"}>
      {plain ? <PlainDocBody {...props} /> : <RichDocBody {...props} />}
    </div>
  );
}
