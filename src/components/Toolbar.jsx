import { memo, useState, useCallback } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faUndo,
  faRedo,
  faRemoveFormat,
  faBold,
  faItalic,
  faUnderline,
  faStrikethrough,
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify,
  faListUl,
  faListOl,
  faTable,
  faLink,
  faUnlink,
  faCode,
  faEdit,
  faFont,
  faHighlighter,
  faFillDrip,
  faPlus,
  faMinus,
  faTrash,
  faGripLines,
  faGripLinesVertical,
} from "@fortawesome/free-solid-svg-icons"
import { SketchPicker } from "react-color"

import { fontFamilies, fontSizes } from "../constants/editorConfig"

/**
 * Editor Toolbar component - No MUI, uses Font Awesome icons
 */
const Toolbar = memo(function Toolbar({
  editor,
  showHtml,
  setShowHtml,
  textColor,
  setTextColor,
  highlightColor,
  setHighlightColor,
  backgroundColor,
  onBackgroundColorChange,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
}) {
  const [tablePopoverOpen, setTablePopoverOpen] = useState(false)
  const [tablePopoverPos, setTablePopoverPos] = useState({ top: 0, left: 0 })
  const [hoveredCell, setHoveredCell] = useState({ rows: 0, cols: 0 })
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [textColorPickerOpen, setTextColorPickerOpen] = useState(false)
  const [textColorPickerPos, setTextColorPickerPos] = useState({ top: 0, left: 0 })
  const [highlightColorPickerOpen, setHighlightColorPickerOpen] = useState(false)
  const [highlightColorPickerPos, setHighlightColorPickerPos] = useState({ top: 0, left: 0 })
  const [backgroundColorPickerOpen, setBackgroundColorPickerOpen] = useState(false)
  const [backgroundColorPickerPos, setBackgroundColorPickerPos] = useState({ top: 0, left: 0 })

  // Font handlers
  const handleFontFamilyChange = useCallback(
    (e) => {
      const value = e.target.value
      setFontFamily(value)
      if (value) {
        editor.chain().focus().setFontFamily(value).run()
      } else {
        editor.chain().focus().unsetFontFamily().run()
      }
    },
    [editor, setFontFamily]
  )

  const handleFontSizeChange = useCallback(
    (e) => {
      const value = e.target.value
      setFontSize(value)
      if (value) {
        editor.chain().focus().setFontSize(value).run()
      } else {
        editor.chain().focus().unsetFontSize().run()
      }
    },
    [editor, setFontSize]
  )

  // Color handlers
  const handleTextColorClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTextColorPickerPos({ top: rect.bottom + 4, left: rect.left })
    setTextColorPickerOpen(true)
  }, [])

  const handleTextColorChange = useCallback(
    (color) => {
      setTextColor(color.hex)
      editor.chain().focus().setColor(color.hex).run()
    },
    [editor, setTextColor]
  )

  const handleHighlightColorClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setHighlightColorPickerPos({ top: rect.bottom + 4, left: rect.left })
    setHighlightColorPickerOpen(true)
  }, [])

  const handleHighlightColorChange = useCallback(
    (color) => {
      setHighlightColor(color.hex)
      editor.chain().focus().toggleHighlight({ color: color.hex }).run()
    },
    [editor, setHighlightColor]
  )

  const handleBackgroundColorClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setBackgroundColorPickerPos({ top: rect.bottom + 4, left: rect.left })
    setBackgroundColorPickerOpen(true)
  }, [])

  const handleBackgroundColorChange = useCallback(
    (color) => {
      onBackgroundColorChange?.(color.hex)
    },
    [onBackgroundColorChange]
  )

  // Table handlers
  const handleTableClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTablePopoverPos({ top: rect.bottom + 4, left: rect.left })
    setTablePopoverOpen(true)
  }, [])

  const handleTableInsert = useCallback(
    (rows, cols) => {
      editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
      setTablePopoverOpen(false)
      setHoveredCell({ rows: 0, cols: 0 })
    },
    [editor]
  )

  // Link handlers
  const handleLinkClick = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href || ""
    setLinkUrl(previousUrl)
    setLinkDialogOpen(true)
  }, [editor])

  const handleLinkSubmit = useCallback(() => {
    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run()
    }
    setLinkDialogOpen(false)
    setLinkUrl("")
  }, [editor, linkUrl])

  // Clear formatting
  const handleClearFormatting = useCallback(() => {
    editor.chain().focus().clearNodes().unsetAllMarks().run()
  }, [editor])

  return (
    <>
      <div className="rte-toolbar">
        {/* Undo/Redo/Clear */}
        <button
          className="rte-btn"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <FontAwesomeIcon icon={faUndo} />
        </button>
        <button
          className="rte-btn"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <FontAwesomeIcon icon={faRedo} />
        </button>
        <button
          className="rte-btn"
          onClick={handleClearFormatting}
          title="Clear Formatting"
        >
          <FontAwesomeIcon icon={faRemoveFormat} />
        </button>

        <span className="rte-toolbar-divider" />

        {/* Font Family */}
        <select
          className="rte-select"
          value={fontFamily}
          onChange={handleFontFamilyChange}
          title="Font Family"
        >
          {fontFamilies.map((font) => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.label}
            </option>
          ))}
        </select>

        {/* Font Size */}
        <select
          className="rte-select"
          value={fontSize}
          onChange={handleFontSizeChange}
          title="Font Size"
          style={{ minWidth: 70 }}
        >
          {fontSizes.map((size) => (
            <option key={size.value} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>

        <span className="rte-toolbar-divider" />

        {/* Text Formatting */}
        <div className="rte-btn-group">
          <button
            className={`rte-btn ${editor.isActive("bold") ? "active" : ""}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold (Ctrl+B)"
          >
            <FontAwesomeIcon icon={faBold} />
          </button>
          <button
            className={`rte-btn ${editor.isActive("italic") ? "active" : ""}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic (Ctrl+I)"
          >
            <FontAwesomeIcon icon={faItalic} />
          </button>
          <button
            className={`rte-btn ${editor.isActive("underline") ? "active" : ""}`}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline (Ctrl+U)"
          >
            <FontAwesomeIcon icon={faUnderline} />
          </button>
          <button
            className={`rte-btn ${editor.isActive("strike") ? "active" : ""}`}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <FontAwesomeIcon icon={faStrikethrough} />
          </button>
        </div>

        <span className="rte-toolbar-divider" />

        {/* Colors */}
        <button
          className="rte-btn rte-color-btn"
          onClick={handleTextColorClick}
          title="Text Color"
        >
          <FontAwesomeIcon icon={faFont} />
          <div className="rte-color-bar" style={{ background: textColor }} />
        </button>
        <button
          className="rte-btn rte-color-btn"
          onClick={handleHighlightColorClick}
          title="Highlight Color"
        >
          <FontAwesomeIcon icon={faHighlighter} />
          <div className="rte-color-bar" style={{ background: highlightColor }} />
        </button>

        <span className="rte-toolbar-divider" />

        {/* Link */}
        <button
          className={`rte-btn ${editor.isActive("link") ? "active" : ""}`}
          onClick={handleLinkClick}
          title="Insert Link (Ctrl+K)"
        >
          <FontAwesomeIcon icon={faLink} />
        </button>
        {editor.isActive("link") && (
          <button
            className="rte-btn"
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Remove Link"
          >
            <FontAwesomeIcon icon={faUnlink} />
          </button>
        )}

        <span className="rte-toolbar-divider" />

        {/* Alignment */}
        <div className="rte-btn-group">
          <button
            className={`rte-btn ${editor.isActive({ textAlign: "left" }) ? "active" : ""}`}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            title="Align Left"
          >
            <FontAwesomeIcon icon={faAlignLeft} />
          </button>
          <button
            className={`rte-btn ${editor.isActive({ textAlign: "center" }) ? "active" : ""}`}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            title="Align Center"
          >
            <FontAwesomeIcon icon={faAlignCenter} />
          </button>
          <button
            className={`rte-btn ${editor.isActive({ textAlign: "right" }) ? "active" : ""}`}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            title="Align Right"
          >
            <FontAwesomeIcon icon={faAlignRight} />
          </button>
          <button
            className={`rte-btn ${editor.isActive({ textAlign: "justify" }) ? "active" : ""}`}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            title="Justify"
          >
            <FontAwesomeIcon icon={faAlignJustify} />
          </button>
        </div>

        <span className="rte-toolbar-divider" />

        {/* Lists */}
        <div className="rte-btn-group">
          <button
            className={`rte-btn ${editor.isActive("bulletList") ? "active" : ""}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet List"
          >
            <FontAwesomeIcon icon={faListUl} />
          </button>
          <button
            className={`rte-btn ${editor.isActive("orderedList") ? "active" : ""}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered List"
          >
            <FontAwesomeIcon icon={faListOl} />
          </button>
        </div>

        <span className="rte-toolbar-divider" />

        {/* Table */}
        <button
          className="rte-btn"
          onClick={handleTableClick}
          title="Insert Table"
        >
          <FontAwesomeIcon icon={faTable} />
        </button>

        <span className="rte-toolbar-divider" />

        {/* Page Background Color */}
        <button
          className="rte-btn rte-color-btn"
          onClick={handleBackgroundColorClick}
          title="Page Background Color"
        >
          <FontAwesomeIcon icon={faFillDrip} />
          <div className="rte-color-bar" style={{ background: backgroundColor }} />
        </button>

        <span className="rte-toolbar-divider" />

        {/* HTML Toggle */}
        <div className="rte-btn-group">
          <button
            className={`rte-btn ${!showHtml ? "active" : ""}`}
            onClick={() => setShowHtml(false)}
            title="Visual Editor"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            className={`rte-btn ${showHtml ? "active" : ""}`}
            onClick={() => setShowHtml(true)}
            title="HTML Code"
          >
            <FontAwesomeIcon icon={faCode} />
          </button>
        </div>
      </div>

      {/* Table Popover */}
      {tablePopoverOpen && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99,
            }}
            onClick={() => {
              setTablePopoverOpen(false)
              setHoveredCell({ rows: 0, cols: 0 })
            }}
          />
          <div
            className="rte-popover"
            style={{ position: "fixed", top: tablePopoverPos.top, left: tablePopoverPos.left }}
          >
            {editor.isActive("table") ? (
              // Show table operations when inside a table
              <div className="rte-table-operations">
                <div className="rte-popover-label">Table Operations</div>
                <button
                  className="rte-table-op-btn"
                  onClick={() => {
                    editor.chain().focus().addRowAfter().run()
                    setTablePopoverOpen(false)
                  }}
                >
                  <FontAwesomeIcon icon={faGripLines} />
                  <FontAwesomeIcon icon={faPlus} className="rte-icon-small" />
                  <span>Add Row Below</span>
                </button>
                <button
                  className="rte-table-op-btn"
                  onClick={() => {
                    editor.chain().focus().addColumnAfter().run()
                    setTablePopoverOpen(false)
                  }}
                >
                  <FontAwesomeIcon icon={faGripLinesVertical} />
                  <FontAwesomeIcon icon={faPlus} className="rte-icon-small" />
                  <span>Add Column Right</span>
                </button>
                <button
                  className="rte-table-op-btn danger"
                  onClick={() => {
                    editor.chain().focus().deleteRow().run()
                    setTablePopoverOpen(false)
                  }}
                >
                  <FontAwesomeIcon icon={faGripLines} />
                  <FontAwesomeIcon icon={faMinus} className="rte-icon-small" />
                  <span>Delete Row</span>
                </button>
                <button
                  className="rte-table-op-btn danger"
                  onClick={() => {
                    editor.chain().focus().deleteColumn().run()
                    setTablePopoverOpen(false)
                  }}
                >
                  <FontAwesomeIcon icon={faGripLinesVertical} />
                  <FontAwesomeIcon icon={faMinus} className="rte-icon-small" />
                  <span>Delete Column</span>
                </button>
                <button
                  className="rte-table-op-btn danger"
                  onClick={() => {
                    editor.chain().focus().deleteTable().run()
                    setTablePopoverOpen(false)
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} />
                  <span>Delete Table</span>
                </button>
              </div>
            ) : (
              // Show table size selector when not in a table
              <>
                <div className="rte-popover-label">
                  {hoveredCell.rows > 0 && hoveredCell.cols > 0
                    ? `${hoveredCell.rows} × ${hoveredCell.cols} Table`
                    : "Select table size"}
                </div>
                <div className="rte-table-grid">
                  {Array.from({ length: 8 }).map((_, rowIndex) =>
                    Array.from({ length: 8 }).map((_, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`rte-table-cell ${
                          rowIndex < hoveredCell.rows && colIndex < hoveredCell.cols ? "active" : ""
                        }`}
                        onClick={() => handleTableInsert(rowIndex + 1, colIndex + 1)}
                        onMouseEnter={() => setHoveredCell({ rows: rowIndex + 1, cols: colIndex + 1 })}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Link Dialog */}
      {linkDialogOpen && (
        <div className="rte-modal-overlay" onClick={() => setLinkDialogOpen(false)}>
          <div className="rte-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Insert Link</h3>
            <input
              type="url"
              className="rte-modal-input"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleLinkSubmit()
                }
              }}
              autoFocus
            />
            <div className="rte-modal-actions">
              <button className="rte-modal-btn" onClick={() => setLinkDialogOpen(false)}>
                Cancel
              </button>
              <button className="rte-modal-btn primary" onClick={handleLinkSubmit}>
                {linkUrl ? "Apply" : "Remove Link"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Text Color Picker */}
      {textColorPickerOpen && (
        <>
          <div
            className="rte-color-picker-overlay"
            onClick={() => setTextColorPickerOpen(false)}
          />
          <div
            className="rte-color-picker-popover"
            style={{ top: textColorPickerPos.top, left: textColorPickerPos.left }}
          >
            <SketchPicker
              color={textColor}
              onChangeComplete={handleTextColorChange}
            />
          </div>
        </>
      )}

      {/* Highlight Color Picker */}
      {highlightColorPickerOpen && (
        <>
          <div
            className="rte-color-picker-overlay"
            onClick={() => setHighlightColorPickerOpen(false)}
          />
          <div
            className="rte-color-picker-popover"
            style={{ top: highlightColorPickerPos.top, left: highlightColorPickerPos.left }}
          >
            <SketchPicker
              color={highlightColor}
              onChangeComplete={handleHighlightColorChange}
            />
          </div>
        </>
      )}

      {/* Background Color Picker */}
      {backgroundColorPickerOpen && (
        <>
          <div
            className="rte-color-picker-overlay"
            onClick={() => setBackgroundColorPickerOpen(false)}
          />
          <div
            className="rte-color-picker-popover"
            style={{ top: backgroundColorPickerPos.top, left: backgroundColorPickerPos.left }}
          >
            <SketchPicker
              color={backgroundColor}
              onChangeComplete={handleBackgroundColorChange}
            />
          </div>
        </>
      )}
    </>
  )
})

export default Toolbar
