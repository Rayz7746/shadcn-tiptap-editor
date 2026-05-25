# Shadcn Tiptap Editor

A portable, controlled rich text editor for React. It includes WYSIWYG, Markdown, and raw HTML Source modes while keeping the reusable editor isolated in `src/components/editor/`.

```tsx
<ShadcnEditor value={value} onChange={setValue} />
```

## Features

- WYSIWYG editor powered by Tiptap
- Markdown mode with HTML output
- Raw HTML Source mode
- Source mode preserves incomplete/broken HTML while typing
- Invalid HTML appears as raw code in Editor mode
- Pretty-printed HTML when switching from Editor to Source
- Headings, lists, quote, code block, horizontal rule
- Bold, italic, underline, strike, subscript, superscript
- Text color, background color, font size, font family
- Link and image insertion
- Alignment controls
- Custom `<center>` support
- Supports `background:` and `background-color:` inline styles
- Self-contained `editor.css`
- Light/dark theme support through shadcn-style CSS variables

## Tech Stack

- React `^19.2.0`
- React DOM `^19.2.0`
- TypeScript `~5.9.3`
- Vite `^7.2.4`
- Tailwind CSS `^3.4.18`
- Tiptap React `^3.11.0`
- Tiptap Core `^3.19.0`
- Tiptap Starter Kit `^3.11.0`
- Marked `^17.0.1`
- Turndown `^7.2.2`
- Lucide React `^0.554.0`

## Reusable Folders

For the smallest editor-only integration, copy:

```txt
src/components/editor/
  ShadcnEditor.tsx
  EditorToolbar.tsx
  editor.css
  index.ts
  extensions/
    BackgroundColor.ts
    Center.ts
    FontFamily.ts
    FontSize.ts
    index.ts
```

This is enough for:

```tsx
<ShadcnEditor value={value} onChange={setValue} />
```

The editor folder does not import `src/components/ui` or `src/lib/utils`.

For the fuller shadcn-style project setup, copy these too:

```txt
src/components/ui/
src/lib/utils.ts
```

The `components/ui` folder contains useful shadcn primitives used by the demo app, including buttons, cards, dialogs, inputs, tabs, selects, tooltips, and form components. It is not required for the isolated editor runtime, but it is important if you want the complete app scaffold or matching UI primitives in another project.

## Drop-In Usage In Another Project

### 1. Copy The Folder(s)

Recommended full shadcn-style install:

```txt
src/components/editor/
src/components/ui/
src/lib/utils.ts
```

Copy them into your project like this:

```txt
your-project/src/components/editor/
your-project/src/components/ui/
your-project/src/lib/utils.ts
```

Use this option if you want the complete project component set, including the editor plus the reusable shadcn-style UI primitives used by the demo app.

Minimal editor-only install:

```txt
src/components/editor/
```

Copy it into your project like this:

```txt
your-project/src/components/editor/
```

Use this option only if you want the editor by itself. The current editor is self-contained and does not import `components/ui`, but `components/ui` is still important if you want the full shadcn-style project setup.

### 2. Install Required Packages

Required for the editor:

```bash
npm install @tiptap/react @tiptap/core @tiptap/starter-kit @tiptap/extension-underline @tiptap/extension-text-style @tiptap/extension-color @tiptap/extension-text-align @tiptap/extension-highlight @tiptap/extension-image @tiptap/extension-link @tiptap/extension-subscript @tiptap/extension-superscript marked turndown lucide-react
```

For TypeScript:

```bash
npm install -D @types/turndown
```

Required if you copy `components/ui` too:

```bash
npm install @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip class-variance-authority clsx tailwind-merge
```

### 3. Use The Component

```tsx
import { useState } from 'react'
import { ShadcnEditor } from '@/components/editor'

export function Example() {
  const [value, setValue] = useState('<p>Hello world</p>')

  return <ShadcnEditor value={value} onChange={setValue} />
}
```

Optional:

```tsx
<ShadcnEditor
  value={value}
  onChange={setValue}
  placeholder="Start writing..."
  minHeight="500px"
  className="my-editor"
/>
```

## Next.js

Use it from a Client Component:

```tsx
'use client'

import { useState } from 'react'
import { ShadcnEditor } from '@/components/editor'

export default function EditorClient() {
  const [value, setValue] = useState('<p>Hello world</p>')

  return <ShadcnEditor value={value} onChange={setValue} />
}
```

If your Next.js setup does not allow CSS imported from the component, import the CSS globally:

```tsx
import '@/components/editor/editor.css'
```

Then remove this from `ShadcnEditor.tsx`:

```ts
import './editor.css'
```

## Local Development

```bash
pnpm install
pnpm dev
```

```bash
pnpm build
pnpm lint
```

## Public API

```ts
interface ShadcnEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  minHeight?: string
}
```

The `value` is always an HTML string.
