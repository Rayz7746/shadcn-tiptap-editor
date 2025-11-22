import { useState } from 'react'
import { RichTextEditor } from './components/RichTextEditor'

function App() {
  const [content, setContent] = useState(`
    <h2>Welcome to your new Editor</h2>
    <p>Try typing specific <strong>Markdown</strong> syntax:</p>
    <ul>
      <li>Type <code>#</code> followed by a space for a heading</li>
      <li>Type <code>-</code> followed by a space for a bullet list</li>
    </ul>
    <blockquote>Source mode is just a click away.</blockquote>
  `)

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-start">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Shadcn + Tiptap Editor</h1>
          <p className="text-muted-foreground">Dual-mode WYSIWYG Editor</p>
        </div>

        {/* Editor component */}
        <RichTextEditor value={content} onChange={setContent} />

        {/* Live output preview */}
        <div className="rounded-lg border bg-slate-950 p-4 text-slate-50 overflow-auto">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Real-time Output</h3>
          <pre className="text-xs font-mono whitespace-pre-wrap break-all">{content}</pre>
        </div>
      </div>
    </div>
  )
}

export default App
