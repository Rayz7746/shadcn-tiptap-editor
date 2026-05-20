import { useState } from 'react'
import { ShadcnEditor } from '@/components/editor'

const SAMPLE_HTML = `<center>
  <h1><a href="https://ICEAChess.org"><strong>ICEAChess.org</strong></a></h1>
  <p><span style="background: yellow; color: red">Color test</span></p>
</center>`

function App() {
  const [content, setContent] = useState(SAMPLE_HTML)

  return (
    <main className="min-h-screen bg-background p-4 text-foreground sm:p-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">ShadcnEditor</h1>
          <p className="text-sm text-muted-foreground">
            Pure controlled usage: value + onChange.
          </p>
        </div>

        <ShadcnEditor value={content} onChange={setContent} minHeight="400px" />
      </div>
    </main>
  )
}

export default App
