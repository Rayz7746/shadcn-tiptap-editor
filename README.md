# Shadcn Tiptap Editor

A reusable React rich text editor built with Tiptap and styled to blend with shadcn-style themes.

The main goal of this project is portability: copy `src/components/editor/` into another React or Next.js project, install the required packages, and use it as a controlled component.

```tsx
<ShadcnEditor value={value} onChange={setValue} />
```

## Features

- WYSIWYG editing with Tiptap
- Markdown editing mode
- Raw HTML Source mode
- Source mode preserves broken/incomplete HTML while typing
- Invalid HTML is shown as raw code in Editor mode instead of being silently normalized
- Pretty-printed HTML when switching from Editor to Source
- Text formatting: bold, italic, underline, strike, subscript, superscript
- Headings, lists, blockquote, code block, horizontal rule
- Text color, background color, font size, and font family
- Link and image insertion
- Text alignment controls
- Custom `<center>` tag support
- Supports both `background:` and `background-color:` inline styles
- Local `editor.css` styles with shadcn CSS variable support
- Light and dark mode friendly

## What Makes It Special

Most rich text editors treat the visual editor as the only source of truth. This editor separates Source mode from Tiptap while the user is typing, so raw HTML stays raw.

That means this stays untouched in Source mode:

```html
<p><span style="color: red">Broken
```

Tiptap only receives the HTML when switching into Editor/Markdown mode. If the HTML is incomplete, the editor shows the broken source as code instead of auto-fixing it.

## Tech Stack

Current demo app versions:

- React `^19.2.0`
- React DOM `^19.2.0`
- TypeScript `~5.9.3`
- Vite `^7.2.4`
- Tailwind CSS `^3.4.18`
- Tiptap React `^3.11.0`
- Tiptap Starter Kit `^3.11.0`
- Tiptap Core `^3.19.0`
- Tiptap extensions `^3.11.0` / table packages `^3.19.0`
- Marked `^17.0.1`
- Turndown `^7.2.2`
- Lucide React `^0.554.0`

## Project Structure

```txt
shadcn-tiptap-editor/
  my-tiptap-editor/
    src/
      App.tsx
      main.tsx
      index.css
      components/
        editor/
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
        ui/
          ...
```

There are two useful copy targets:

### Minimal Editor Drop-In

```txt
src/components/editor/
```

This is enough if you only want:

```tsx
<ShadcnEditor value={value} onChange={setValue} />
```

The editor folder is self-contained and does not import `src/components/ui` or `src/lib/utils`.

### Full shadcn-style Project Setup

If you want the surrounding shadcn-style app scaffold as well, copy both folders:

```txt
src/components/editor/
src/components/ui/
src/lib/utils.ts
```

The `components/ui` folder contains reusable shadcn primitives such as `Button`, `Card`, `Dialog`, `Input`, `Tabs`, `Select`, `Tooltip`, and form helpers. The editor no longer strictly depends on them, but they matter if you want the full demo layout, matching app primitives, or a ready shadcn-style component library in the target project.

## Local Development

```bash
cd my-tiptap-editor
pnpm install
pnpm dev
```

Build and lint:

```bash
pnpm build
pnpm lint
```

## Drop-In Usage In Another Project

### 1. Copy The Folder(s)

Recommended full shadcn-style install:

```txt
my-tiptap-editor/src/components/editor/
my-tiptap-editor/src/components/ui/
my-tiptap-editor/src/lib/utils.ts
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
my-tiptap-editor/src/components/editor/
```

For example:

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

Optional props:

```tsx
<ShadcnEditor
  value={value}
  onChange={setValue}
  placeholder="Start writing..."
  minHeight="500px"
  className="my-editor"
/>
```

## Next.js Notes

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

If Next.js complains about importing CSS from `ShadcnEditor.tsx`, move the CSS import to your global app entry:

```tsx
import '@/components/editor/editor.css'
```

Then remove this line from `ShadcnEditor.tsx`:

```ts
import './editor.css'
```

## Theme Requirements

The editor works best with shadcn-style CSS variables:

```css
--background
--foreground
--border
--muted
--muted-foreground
--primary
--primary-foreground
--accent
--accent-foreground
--popover
--popover-foreground
--destructive
--ring
--radius
```

Fallback values are included, so the editor still renders without shadcn. If your app supports dark mode by toggling `.dark` and changing these CSS variables, the editor follows automatically.

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

The value is always an HTML string.
