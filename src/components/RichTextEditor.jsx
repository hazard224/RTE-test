import { useState, useEffect, useCallback, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TextAlign } from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { FontFamily } from "@tiptap/extension-font-family"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import { Highlight } from "@tiptap/extension-highlight"
import { Underline } from "@tiptap/extension-underline"
import { Link } from "@tiptap/extension-link"

import FontSize from "../extensions/FontSize"
import Toolbar from "./Toolbar"
import CodeEditor from "./CodeEditor"
import "./RichTextEditor.css"

// Format HTML with proper indentation
function formatHTML(html) {
  let formatted = ""
  let indent = 0
  const tab = "  "
  
  // Split by tags
  html.split(/(<[^>]+>)/g).forEach((node) => {
    if (!node.trim()) return
    
    // Check if it's a closing tag
    if (node.match(/^<\/\w/)) {
      indent = Math.max(0, indent - 1)
    }
    
    // Add indentation and the node
    if (node.match(/^</) || formatted === "") {
      formatted += (formatted ? "\n" : "") + tab.repeat(indent) + node
    } else {
      formatted += node
    }
    
    // Check if it's an opening tag (and not self-closing)
    if (node.match(/^<\w/) && !node.match(/\/>/)) {
      indent++
    }
  })
  
  return formatted
}

export default function RichTextEditor({
  value = "",
  onChange,
  height: initialHeight = 300,
  backgroundColor: initialBackgroundColor = "#ffffff",
  onBackgroundColorChange,
}) {
  const [showHtml, setShowHtml] = useState(false)
  const [htmlContent, setHtmlContent] = useState("")
  const [styleContent, setStyleContent] = useState("")
  const [textColor, setTextColor] = useState("#000000")
  const [fontFamily, setFontFamily] = useState("Arial")
  const [fontSize, setFontSize] = useState("16px")
  const [highlightColor, setHighlightColor] = useState("#ffff00")
  const [backgroundColor, setBackgroundColor] = useState(initialBackgroundColor)
  const [, forceUpdate] = useState(0)

  const isInternalUpdate = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable extensions we're configuring separately
        link: false,
      }),
      TextStyle,
      FontSize,
      FontFamily,
      Color,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate({ editor }) {
      isInternalUpdate.current = true
      const editorHtml = editor.getHTML()
      // Combine style tags with editor content
      const fullHtml = styleContent ? `${styleContent}\n${editorHtml}` : editorHtml
      onChange?.(fullHtml)
    },
    onSelectionUpdate() {
      forceUpdate((n) => n + 1)
    },
  })

  // Keep editor in sync if value prop changes externally
  useEffect(() => {
    if (editor && !isInternalUpdate.current && value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
    }
    isInternalUpdate.current = false
  }, [value, editor])

  // Update local state when cursor position changes
  useEffect(() => {
    if (!editor) return

    const updateStyleState = () => {
      const attrs = editor.getAttributes("textStyle")
      if (attrs.fontFamily) setFontFamily(attrs.fontFamily)
      if (attrs.fontSize) setFontSize(attrs.fontSize)
      if (attrs.color) setTextColor(attrs.color)
    }

    editor.on("selectionUpdate", updateStyleState)
    return () => {
      editor.off("selectionUpdate", updateStyleState)
    }
  }, [editor])

  // Sync HTML content when toggling to HTML view
  useEffect(() => {
    if (showHtml && editor) {
      const fullHtml = formatHTML(editor.getHTML())
      // Extract style tags
      const styleMatch = value.match(/<style[^>]*>[\s\S]*?<\/style>/gi)
      if (styleMatch) {
        setStyleContent(styleMatch.join('\n'))
        setHtmlContent(fullHtml)
      } else {
        setStyleContent('')
        setHtmlContent(fullHtml)
      }
    }
  }, [showHtml, editor, value])

  // Handle background color changes
  const handleBackgroundColorChange = useCallback(
    (color) => {
      setBackgroundColor(color)
      onBackgroundColorChange?.(color)
    },
    [onBackgroundColorChange]
  )

  if (!editor) return null

  return (
    <div className="rte-container">
      <Toolbar
        editor={editor}
        showHtml={showHtml}
        setShowHtml={setShowHtml}
        textColor={textColor}
        setTextColor={setTextColor}
        highlightColor={highlightColor}
        setHighlightColor={setHighlightColor}
        backgroundColor={backgroundColor}
        onBackgroundColorChange={handleBackgroundColorChange}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />

      {showHtml ? (
        <div className="rte-html-view" style={{ minHeight: initialHeight }}>
          <CodeEditor
            value={styleContent ? `${styleContent}\n${htmlContent}` : htmlContent}
            onChange={(code) => {
              // Split style tags from content
              const styleMatch = code.match(/<style[^>]*>[\s\S]*?<\/style>/gi)
              if (styleMatch) {
                setStyleContent(styleMatch.join('\n'))
                const contentWithoutStyles = code.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').trim()
                setHtmlContent(contentWithoutStyles)
              } else {
                setStyleContent('')
                setHtmlContent(code)
              }
            }}
            onBlur={() => {
              if (editor) {
                // Only set the content without style tags to the editor
                editor.commands.setContent(htmlContent)
                // Emit the full HTML including styles
                const fullHtml = styleContent ? `${styleContent}\n${htmlContent}` : htmlContent
                onChange?.(fullHtml)
              }
            }}
            style={{ minHeight: initialHeight }}
          />
        </div>
      ) : (
        <div className="rte-content" style={{ minHeight: initialHeight, backgroundColor }}>
          <EditorContent editor={editor} />
        </div>
      )}
    </div>
  )
}
