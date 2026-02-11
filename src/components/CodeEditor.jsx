import Editor from "react-simple-code-editor"
import { highlight, languages } from "prismjs/components/prism-core"
import "prismjs/components/prism-markup"
import "prismjs/components/prism-css"
import "prismjs/themes/prism.css"

/**
 * Code editor with HTML and CSS syntax highlighting
 */
export default function CodeEditor({ value, onChange, onBlur, style }) {
  const handleValueChange = (code) => {
    onChange(code)
  }

  // Enhanced highlighting that handles CSS within style tags
  const highlightWithCss = (code) => {
    // First do HTML highlighting
    let highlighted = highlight(code, languages.markup, "markup")
    
    // Then enhance CSS within style tags
    highlighted = highlighted.replace(
      /(<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;<\/span>style<\/span>[^>]*<span class="token punctuation">&gt;<\/span><\/span>)([\s\S]*?)(<span class="token tag"><span class="token tag"><span class="token punctuation">&lt;\/span>style<\/span><span class="token punctuation">&gt;<\/span><\/span>)/g,
      (match, openTag, cssContent, closeTag) => {
        // Decode HTML entities in CSS content
        const decoded = cssContent
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
        
        // Highlight CSS
        const highlightedCss = highlight(decoded, languages.css, 'css')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/&/g, '&amp;')
        
        return openTag + highlightedCss + closeTag
      }
    )
    
    return highlighted
  }

  return (
    <Editor
      value={value}
      onValueChange={handleValueChange}
      onBlur={onBlur}
      highlight={highlightWithCss}
      padding={16}
      style={{
        fontFamily: "monospace",
        fontSize: 14,
        backgroundColor: "#fff",
        border: "none",
        outline: "none",
        ...style,
      }}
    />
  )
}
