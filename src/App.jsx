import { useState, useRef, useEffect } from "react"
import RichTextEditor from "./components/RichTextEditor"

export default function App() {
  const [html, setHtml] = useState("")
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const iframeRef = useRef(null)

  // Update iframe content whenever html changes
  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument
      doc.open()
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 16px;
                margin: 0;
                line-height: 1.6;
                background-color: ${backgroundColor};
              }
              table {
                border-collapse: collapse;
                width: 100%;
                margin: 1em 0;
              }
              th, td {
                border: 1px solid #ccc;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f5f5f5;
              }
            </style>
          </head>
          <body>${html}</body>
        </html>
      `)
      doc.close()
    }
  }, [html, backgroundColor])

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "whitesmoke",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px",
      }}
    >
      <h2 style={{ marginBottom: 20, color: "#333" }}>Editor Demo</h2>

      <RichTextEditor
        value={html}
        onChange={setHtml}
        height={400}
        backgroundColor={backgroundColor}
        onBackgroundColorChange={setBackgroundColor}
      />

      {/* Iframe Preview */}
      <div style={{ marginTop: 30, maxWidth: 1100, width: "100%" }}>
        <h3 style={{ color: "#333", marginBottom: 10 }}>Preview (iframe)</h3>
        <iframe
          ref={iframeRef}
          title="HTML Preview"
          style={{
            width: "100%",
            height: 300,
            border: "1px solid #ddd",
            borderRadius: 4,
            backgroundColor: "#fff",
          }}
        />
      </div>

      {/* Raw HTML */}
      <div style={{ marginTop: 30, maxWidth: 1100, width: "100%" }}>
        <h3 style={{ color: "#333", marginBottom: 10 }}>Raw HTML</h3>
        <pre
          style={{
            backgroundColor: "#fff",
            padding: 16,
            borderRadius: 4,
            border: "1px solid #ddd",
            overflow: "auto",
            fontSize: 13,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {html}
        </pre>
      </div>
    </div>
  )
}
