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
import { GenericHTML } from "../extensions/GenericHTML"
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

// Clean up table HTML by removing redundant inline styles
function cleanTableHTML(html) {
  // Check if there are tables
  if (!html.includes('<table')) return html
  
  // Add style tag before tables with common table styles
  const tableStyles = `<style>
  table { border-collapse: collapse; margin: 1em 0; width: 100%; table-layout: fixed; }
  th { border: 1px solid #ccc; padding: 8px; text-align: left; background: #f5f5f5; font-weight: bold; }
  td { border: 1px solid #ccc; padding: 8px; text-align: left; word-wrap: break-word; }
</style>`
  
  // Remove inline styles from table elements
  let cleaned = html
    .replace(/<table[^>]*style="[^"]*"([^>]*)>/g, '<table$1>')
    .replace(/<th[^>]*style="[^"]*"([^>]*)>/g, '<th$1>')
    .replace(/<td[^>]*style="[^"]*"([^>]*)>/g, '<td$1>')
  
  // Add style tag if we cleaned any tables
  if (cleaned !== html) {
    cleaned = tableStyles + '\n' + cleaned
  }
  
  return cleaned
}

export default function RichTextEditor({
  value = "",
  onChange,
  height: initialHeight = 300,
  backgroundColor: initialBackgroundColor = "#ffffff",
  onBackgroundColorChange,
}) {
  const [showHtml, setShowHtml] = useState(false)
  const [codeContent, setCodeContent] = useState(value) // The authoritative HTML source
  
  // Extract style/script tags for WYSIWYG view scoping
  const extractedStyles = codeContent.match(/<style[^>]*>[\s\S]*?<\/style>/gi)?.join('\n') || ''
  const extractedScripts = codeContent.match(/<script[^>]*>[\s\S]*?<\/script>/gi)?.join('\n') || ''
  
  const [textColor, setTextColor] = useState("#000000")
  const [fontFamily, setFontFamily] = useState("Arial")
  const [fontSize, setFontSize] = useState("16px")
  const [highlightColor, setHighlightColor] = useState("#ffff00")
  const [backgroundColor, setBackgroundColor] = useState(initialBackgroundColor)
  const [, forceUpdate] = useState(0)

  const isInternalUpdate = useRef(false)
  const onChangeTimeoutRef = useRef(null)
  const prevShowHtml = useRef(showHtml)
  const initialValueLoaded = useRef(false)

  // Get content without style/script tags for WYSIWYG editor
  const getEditorContent = (html) => {
    if (!html) return ''
    let content = html
    content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // Strip document-level tags that shouldn't be in editor content
    content = content.replace(/<\/?html[^>]*>/gi, '')
    content = content.replace(/<\/?head[^>]*>/gi, '')
    content = content.replace(/<\/?body[^>]*>/gi, '')
    return content.trim()
  }

  // Debounced onChange to prevent rapid updates
  const debouncedOnChange = useCallback((html) => {
    if (onChangeTimeoutRef.current) {
      clearTimeout(onChangeTimeoutRef.current)
    }
    onChangeTimeoutRef.current = setTimeout(() => {
      onChange?.(html)
    }, 150) // 150ms debounce
  }, [onChange])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (onChangeTimeoutRef.current) {
        clearTimeout(onChangeTimeoutRef.current)
      }
    }
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable extensions we're configuring separately
        textStyle: false, // Disabled because we configure it explicitly
        strike: false, // Will use Underline instead
        bold: {
          HTMLAttributes: {
            class: null,
          },
        },
        italic: {
          HTMLAttributes: {
            class: null,
          },
        },
        // Configure paragraph to be less aggressive
        paragraph: {
          HTMLAttributes: {
            class: 'tiptap-paragraph',
          },
        },
        // Configure lists to preserve structure
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
          HTMLAttributes: {
            class: 'tiptap-ul',
          },
        },
        listItem: {
          keepMarks: true,
          keepAttributes: true,
          HTMLAttributes: {
            class: 'tiptap-li',
          },
        },
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
        allowTableNodeSelection: true,
        HTMLAttributes: {
          style: 'border-collapse: collapse; margin: 1em 0; width: 100%; table-layout: fixed;',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          style: 'border: 1px solid #ccc; padding: 8px; text-align: left; background: #f5f5f5; font-weight: bold;',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          style: 'border: 1px solid #ccc; padding: 8px; text-align: left; word-wrap: break-word;',
        },
      }),
      GenericHTML, // Support for nav, div, section, etc.
    ],
    content: getEditorContent(value),
    editorProps: {
      attributes: {
        class: 'tiptap-editor',
      },
    },
    parseOptions: {
      preserveWhitespace: 'full',
    },
    onUpdate({ editor }) {
      if (showHtml) return // Don't update while in code view
      
      isInternalUpdate.current = true
      let editorHtml = cleanTableHTML(editor.getHTML())
      
      // Cleanup unwanted Tiptap wrapping
      editorHtml = editorHtml.replace(/<p[^>]*>(\s*<nav[^>]*>[\s\S]*?<\/nav>\s*)<\/p>/gi, '$1')
      editorHtml = editorHtml.replace(/<p[^>]*>(\s*<ul[^>]*>)/gi, '$1')
      editorHtml = editorHtml.replace(/<p[^>]*>(\s*<ol[^>]*>)/gi, '$1')
      editorHtml = editorHtml.replace(/(<\/ul>\s*)<\/p>/gi, '$1')
      editorHtml = editorHtml.replace(/(<\/ol>\s*)<\/p>/gi, '$1')
      editorHtml = editorHtml.replace(/<li[^>]*>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/li>/gi, '<li>$1</li>')
      editorHtml = editorHtml.replace(/ class="tiptap-[^"]*"/g, '')
      
      // Format HTML with proper indentation
      editorHtml = formatHTML(editorHtml)
      
      // Combine with style/script tags
      let fullHtml = editorHtml
      if (extractedStyles) fullHtml = `${extractedStyles}\n${fullHtml}`
      if (extractedScripts) fullHtml = `${fullHtml}\n${extractedScripts}`
      
      setCodeContent(fullHtml)
      debouncedOnChange(fullHtml) // Debounced to prevent rapid updates
      
      // Reset flag after state updates
      setTimeout(() => {
        isInternalUpdate.current = false
      }, 0)
    },
    onSelectionUpdate() {
      forceUpdate((n) => n + 1)
    },
    onTransaction() {
      forceUpdate((n) => n + 1)
    },
  })

  // Update codeContent when external value changes
  useEffect(() => {
    if (value !== codeContent && !isInternalUpdate.current) {
      setCodeContent(value)
    }
    isInternalUpdate.current = false
  }, [value, codeContent])

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


  // Sync between views when toggling
  useEffect(() => {
    if (!editor) return
    
    // Only run when showHtml actually changes (user toggles views)
    if (prevShowHtml.current === showHtml) return
    prevShowHtml.current = showHtml
    
    if (showHtml) {
      // Toggling TO code view: sync from WYSIWYG
      isInternalUpdate.current = true
      let editorHtml = cleanTableHTML(editor.getHTML())
      
      // Cleanup unwanted Tiptap classes and wrapping (same as onUpdate)
      editorHtml = editorHtml.replace(/<p[^>]*>(\s*<nav[^>]*>[\s\S]*?<\/nav>\s*)<\/p>/gi, '$1')
      editorHtml = editorHtml.replace(/<p[^>]*>(\s*<ul[^>]*>)/gi, '$1')
      editorHtml = editorHtml.replace(/<p[^>]*>(\s*<ol[^>]*>)/gi, '$1')
      editorHtml = editorHtml.replace(/(<\/ul>\s*)<\/p>/gi, '$1')
      editorHtml = editorHtml.replace(/(<\/ol>\s*)<\/p>/gi, '$1')
      editorHtml = editorHtml.replace(/<li[^>]*>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/li>/gi, '<li>$1</li>')
      editorHtml = editorHtml.replace(/ class="tiptap-[^"]*"/g, '')
      
      // Format HTML with proper indentation
      editorHtml = formatHTML(editorHtml)
      
      // Combine with style/script tags
      let fullHtml = editorHtml
      if (extractedStyles) fullHtml = `${extractedStyles}\n${fullHtml}`
      if (extractedScripts) fullHtml = `${fullHtml}\n${extractedScripts}`
      
      setCodeContent(fullHtml)
      
      setTimeout(() => {
        isInternalUpdate.current = false
      }, 0)
    } else {
      // Toggling TO WYSIWYG view: load from code content
      const editorContent = getEditorContent(codeContent)
      
      if (editorContent && editorContent.trim()) {
        isInternalUpdate.current = true
        editor.commands.setContent(editorContent, false)
        
        setTimeout(() => {
          isInternalUpdate.current = false
        }, 0)
      }
    }
  }, [showHtml, editor, extractedStyles, extractedScripts, codeContent])
  
  // Initial value load only (not on subsequent updates)
  useEffect(() => {
    if (!editor || initialValueLoaded.current) return
    
    if (value && !showHtml) {
      const editorContent = getEditorContent(value)
      if (editorContent && editorContent.trim()) {
        setCodeContent(value)
        editor.commands.setContent(editorContent, false)
        initialValueLoaded.current = true
      }
    }
  }, [editor])

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
            value={codeContent}
            onChange={(code) => {
              isInternalUpdate.current = true
              setCodeContent(code)
              debouncedOnChange(code) // Debounced to prevent rapid updates
              setTimeout(() => {
                isInternalUpdate.current = false
              }, 0)
            }}
            style={{ minHeight: initialHeight }}
          />
        </div>
      ) : (
        <>
          {/* Inject extracted styles with scoping for WYSIWYG editor */}
          {extractedStyles && (
            <style 
              dangerouslySetInnerHTML={{ 
                __html: extractedStyles
                  .replace(/<\/?style[^>]*>/gi, '')
                  .replace(/([^}]+){/g, (match, selector) => {
                    if (selector.includes('.rte-content') || selector.includes('.ProseMirror')) {
                      return match;
                    }
                    const selectors = selector.split(',').map(s => {
                      const trimmed = s.trim();
                      if (trimmed === 'body') {
                        return '.rte-content .ProseMirror';
                      }
                      return `.rte-content .ProseMirror ${trimmed}`;
                    }).join(',');
                    return `${selectors} {`;
                  })
              }} 
            />
          )}
          <div className="rte-content" style={{ minHeight: initialHeight, backgroundColor }}>
            <EditorContent editor={editor} />
          </div>
        </>
      )}
    </div>
  )
}