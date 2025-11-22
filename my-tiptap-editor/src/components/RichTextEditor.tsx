import { useState, useEffect, useCallback } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import LinkExtension from '@tiptap/extension-link'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Code,
  FileCode,
  Undo,
  Redo,
} from 'lucide-react'
import { cn } from '../lib/utils'

// 1. Minimal shadcn-like button helper used only inside this editor demo
const Button = ({ className, variant = 'default', size = 'default', isActive, ...props }: any) => {
  const variants: any = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground text-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  }
  const sizes: any = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    icon: 'h-9 w-9',
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        isActive && 'bg-accent text-accent-foreground',
        className,
      )}
      {...props}
    />
  )
}

const EditorToolbar = ({ editor, isSourceMode, toggleSourceMode }: { editor: Editor | null; isSourceMode: boolean; toggleSourceMode: () => void }) => {
  if (!editor) return null

  return (
    <div className="flex flex-wrap items-center gap-1 border-b bg-muted/20 p-1">
      {!isSourceMode && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')}>
            <Code className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}>
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}>
            <Quote className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
            <Redo className="h-4 w-4" />
          </Button>
        </>
      )}

      <div className="flex-1" />

      <Button variant={isSourceMode ? 'secondary' : 'ghost'} size="sm" onClick={toggleSourceMode} className="gap-2 text-xs h-8">
        <FileCode className="h-3.5 w-3.5" />
        {isSourceMode ? 'Preview' : 'Source'}
      </Button>
    </div>
  )
}

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const [isSourceMode, setIsSourceMode] = useState(false)
  const [sourceContent, setSourceContent] = useState(value)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-none min-h-[200px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      if (!isSourceMode) {
        onChange(editor.getHTML())
      }
    },
  })

  useEffect(() => {
    if (editor && !isSourceMode && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor, isSourceMode])

  const toggleSourceMode = useCallback(() => {
    if (isSourceMode) {
      editor?.commands.setContent(sourceContent)
      setIsSourceMode(false)
    } else {
      setSourceContent(editor?.getHTML() || '')
      setIsSourceMode(true)
    }
  }, [editor, isSourceMode, sourceContent])

  if (!editor) return null

  return (
    <div
      className={cn(
        'flex flex-col w-full rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className,
      )}
    >
      <EditorToolbar editor={editor} isSourceMode={isSourceMode} toggleSourceMode={toggleSourceMode} />

      <div className="relative flex-1 min-h-[200px]">
        {isSourceMode ? (
          <textarea
            value={sourceContent}
            onChange={(e) => {
              setSourceContent(e.target.value)
              onChange(e.target.value)
            }}
            className="w-full h-full min-h-[200px] resize-none border-0 bg-transparent p-4 font-mono text-sm focus:outline-none"
            placeholder="Enter HTML or Markdown..."
            spellCheck={false}
          />
        ) : (
          <EditorContent editor={editor} className="h-full" />
        )}
      </div>
    </div>
  )
}
