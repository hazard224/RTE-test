import Editor from "react-simple-code-editor"
import { highlight, languages } from "prismjs/components/prism-core"
import "prismjs/components/prism-markup"
import "prismjs/themes/prism.css"

/**
 * Simple code editor with HTML syntax highlighting
 */
export default function CodeEditor({ value, onChange, onBlur, style }) {
  const handleValueChange = (code) => {
    onChange(code)
  }

  return (
    <Editor
      value={value}
      onValueChange={handleValueChange}
      onBlur={onBlur}
      highlight={(code) => highlight(code, languages.markup, "markup")}
      padding={16}
      style={{
        fontFamily: "monospace",
        fontSize: 14,
        backgroundColor: "#fff",
        border: "none",
        outline: "none",
        ...style,
      }}
      textareaClassName="code-editor-textarea"
    />
  )
}
