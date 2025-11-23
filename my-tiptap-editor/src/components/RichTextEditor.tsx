import { useState, useEffect, useCallback, useMemo, type ComponentType } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from 'tiptap-markdown'
import LinkExtension from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Image from '@tiptap/extension-image'
import { marked } from 'marked'
import TurndownService from 'turndown'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Baseline,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Underline as UnderlineIcon,
  Undo,
  Minus,
  Eraser,
  Pipette,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { HexAlphaColorPicker } from 'react-colorful'

const DEFAULT_HEX_COLOR = '#000000ff'

const clampValue = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const toHex = (value: number) => clampValue(Math.round(value), 0, 255).toString(16).padStart(2, '0')

const normalizeHexWithAlpha = (value?: string): string => {
  if (!value) return DEFAULT_HEX_COLOR
  if (value.startsWith('#')) {
    let hex = value.slice(1)
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('')
    }
    if (hex.length === 6) return `#${hex.toLowerCase()}ff`
    if (hex.length === 8) return `#${hex.toLowerCase()}`
    return DEFAULT_HEX_COLOR
  }

  const rgbMatch = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)/i)
  if (rgbMatch) {
    const [, rRaw, gRaw, bRaw, aRaw] = rgbMatch
    const r = clampValue(Number(rRaw), 0, 255)
    const g = clampValue(Number(gRaw), 0, 255)
    const b = clampValue(Number(bRaw), 0, 255)
    const a = aRaw !== undefined ? clampValue(Number(aRaw), 0, 1) : 1
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a * 255)}`
  }

  return DEFAULT_HEX_COLOR
}

const hexAlphaToCss = (hex: string) => {
  const baseHex = hex.slice(0, 7)
  const alpha = parseInt(hex.slice(7, 9), 16) / 255
  if (alpha >= 0.999) return baseHex
  const r = parseInt(baseHex.slice(1, 3), 16)
  const g = parseInt(baseHex.slice(3, 5), 16)
  const b = parseInt(baseHex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${Number(alpha.toFixed(2))})`
}

const getAlphaPercent = (hex: string) => Math.round((parseInt(hex.slice(7, 9), 16) / 255) * 100)

const setAlphaPercent = (hex: string, percent: number) => {
  const normalized = clampValue(percent, 0, 100)
  const alphaHex = toHex((normalized / 100) * 255)
  return `${hex.slice(0, 7)}${alphaHex}`
}

const isValidHex = (value: string) => /^#([0-9a-fA-F]{6})$/.test(value)

const ColorPicker = ({
  color,
  onChange,
  icon: Icon,
  label,
}: {
  color?: string
  onChange: (color: string) => void
  icon: ComponentType<{ className?: string }>
  label: string
}) => {
  const defaultHex = normalizeHexWithAlpha(color)
  const [hexValue, setHexValue] = useState(defaultHex)
  const [hexField, setHexField] = useState(defaultHex.slice(0, 7).toUpperCase())
  const [alphaPercent, setAlphaPercentState] = useState(getAlphaPercent(defaultHex))
  const [eyeDropperAvailable, setEyeDropperAvailable] = useState(false)

  useEffect(() => {
    const normalized = normalizeHexWithAlpha(color)
    setHexValue(normalized)
    setHexField(normalized.slice(0, 7).toUpperCase())
    setAlphaPercentState(getAlphaPercent(normalized))
  }, [color])

  useEffect(() => {
    setEyeDropperAvailable(typeof window !== 'undefined' && 'EyeDropper' in window)
  }, [])

  const applyColorChange = useCallback(
    (nextHex: string) => {
      setHexValue(nextHex)
      setHexField(nextHex.slice(0, 7).toUpperCase())
      setAlphaPercentState(getAlphaPercent(nextHex))
      onChange(hexAlphaToCss(nextHex))
    },
    [onChange],
  )

  const handlePickerChange = useCallback(
    (next: string) => {
      applyColorChange(next)
    },
    [applyColorChange],
  )

  const handleHexInputChange = (value: string) => {
    const prefixed = value.startsWith('#') ? value : `#${value}`
    setHexField(prefixed.toUpperCase())
    if (isValidHex(prefixed)) {
      applyColorChange(`${prefixed.toLowerCase()}${hexValue.slice(7)}`)
    }
  }

  const handleAlphaChange = (nextValue: number) => {
    const normalized = clampValue(nextValue, 0, 100)
    setAlphaPercentState(normalized)
    const updated = setAlphaPercent(hexValue, normalized)
    setHexValue(updated)
    onChange(hexAlphaToCss(updated))
  }

  const handleEyeDropper = async () => {
    const eyeDropperCtor = (window as typeof window & { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } }).EyeDropper
    if (!eyeDropperCtor) return
    try {
      const instance = new eyeDropperCtor()
      const result = await instance.open()
      if (result?.sRGBHex) {
        const normalized = `${normalizeHexWithAlpha(result.sRGBHex).slice(0, 7)}${hexValue.slice(7)}`
        applyColorChange(normalized)
      }
    } catch (error) {
      console.warn('EyeDropper cancelled or unavailable', error)
    }
  }

  return (
    <Tooltip>
      <Popover>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0 relative">
              <Icon className="h-4 w-4" />
              <span
                className="absolute bottom-1 right-1 h-2 w-2 rounded-full border border-border"
                style={{ backgroundColor: hexAlphaToCss(hexValue) }}
              />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {label}
        </TooltipContent>
        <PopoverContent align="start" className="color-picker-panel w-72 space-y-4">
          <div className="flex items-center justify-between text-xs font-medium uppercase text-muted-foreground">
            <span>{label}</span>
            <span>{hexValue.slice(0, 7).toUpperCase()}</span>
          </div>
          <HexAlphaColorPicker color={hexValue} onChange={handlePickerChange} />
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleEyeDropper}
              title="Pick from screen"
              disabled={!eyeDropperAvailable}
            >
              <Pipette className="h-4 w-4" />
            </Button>
            <input
              type="range"
              min={0}
              max={100}
              value={alphaPercent}
              onChange={(event) => handleAlphaChange(Number(event.target.value))}
              className="color-picker-range"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value="hex" disabled>
              <SelectTrigger className="h-9 w-[72px] text-xs">HEX</SelectTrigger>
              <SelectContent>
                <SelectItem value="hex">HEX</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={hexField}
              onChange={(event) => handleHexInputChange(event.target.value)}
              className="font-mono text-xs"
              aria-label="Hex value"
            />
            <Input
              type="number"
              min={0}
              max={100}
              value={alphaPercent}
              onChange={(event) => handleAlphaChange(Number(event.target.value))}
              className="w-16 text-center text-xs"
              aria-label="Alpha percent"
            />
          </div>
        </PopoverContent>
      </Popover>
    </Tooltip>
  )
}

type EditorMode = 'editor' | 'source' | 'markdown'

const EditorToolbar = ({ editor, mode, onOpenImageDialog }: { editor: Editor | null; mode: EditorMode; onOpenImageDialog: () => void }) => {
  if (!editor || mode !== 'editor') return null

  const styleValue = editor.isActive('heading', { level: 1 })
    ? 'heading1'
    : editor.isActive('heading', { level: 2 })
    ? 'heading2'
    : editor.isActive('heading', { level: 3 })
    ? 'heading3'
    : 'paragraph'

  const styleOptions = [
    { label: 'Paragraph', value: 'paragraph' },
    { label: 'Heading 1', value: 'heading1' },
    { label: 'Heading 2', value: 'heading2' },
    { label: 'Heading 3', value: 'heading3' },
  ]

  const handleStyleChange = (value: string) => {
    const chain = editor.chain().focus()
    if (value === 'paragraph') chain.setParagraph().run()
    if (value === 'heading1') chain.toggleHeading({ level: 1 }).run()
    if (value === 'heading2') chain.toggleHeading({ level: 2 }).run()
    if (value === 'heading3') chain.toggleHeading({ level: 3 }).run()
  }

  return (
    <TooltipProvider delayDuration={150} disableHoverableContent>
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/20 px-2 py-1">
        <ToggleGroup type="single" className="gap-0">
          <ToggleGroupItem value="undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} aria-label="Undo">
            <Undo className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} aria-label="Redo">
            <Redo className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        
        <Separator orientation="vertical" className="mx-1 h-6" />

        <Select value={styleValue} onValueChange={handleStyleChange}>
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue placeholder="Paragraph" />
          </SelectTrigger>
          <SelectContent>
            {styleOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToggleGroup type="multiple" className="gap-0">
          <ToggleGroupItem value="bold" aria-label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} data-state={editor.isActive('bold') ? 'on' : 'off'}>
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} data-state={editor.isActive('italic') ? 'on' : 'off'}>
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} data-state={editor.isActive('underline') ? 'on' : 'off'}>
            <UnderlineIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="strike" aria-label="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} data-state={editor.isActive('strike') ? 'on' : 'off'}>
            <Strikethrough className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <ToggleGroup type="multiple" className="gap-0">
          <ToggleGroupItem value="subscript" aria-label="Subscript" onClick={() => editor.chain().focus().toggleSubscript().run()} data-state={editor.isActive('subscript') ? 'on' : 'off'}>
            <SubscriptIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="superscript" aria-label="Superscript" onClick={() => editor.chain().focus().toggleSuperscript().run()} data-state={editor.isActive('superscript') ? 'on' : 'off'}>
            <SuperscriptIcon className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ColorPicker 
          label="Text Color" 
          icon={Baseline} 
          color={editor.getAttributes('textStyle').color} 
          onChange={(color) => editor.chain().focus().setColor(color).run()} 
        />
        <ColorPicker 
          label="Highlight" 
          icon={Highlighter} 
          color={editor.getAttributes('highlight').color} 
          onChange={(color) => editor.chain().focus().toggleHighlight({ color }).run()} 
        />
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().unsetAllMarks().run()} title="Clear Formatting">
          <Eraser className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToggleGroup type="single" className="gap-0">
          <ToggleGroupItem value="left" aria-label="Align Left" onClick={() => editor.chain().focus().setTextAlign('left').run()} data-state={editor.isActive({ textAlign: 'left' }) ? 'on' : 'off'}>
            <AlignLeft className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align Center" onClick={() => editor.chain().focus().setTextAlign('center').run()} data-state={editor.isActive({ textAlign: 'center' }) ? 'on' : 'off'}>
            <AlignCenter className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align Right" onClick={() => editor.chain().focus().setTextAlign('right').run()} data-state={editor.isActive({ textAlign: 'right' }) ? 'on' : 'off'}>
            <AlignRight className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="justify" aria-label="Justify" onClick={() => editor.chain().focus().setTextAlign('justify').run()} data-state={editor.isActive({ textAlign: 'justify' }) ? 'on' : 'off'}>
            <AlignJustify className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToggleGroup type="multiple" className="gap-0">
          <ToggleGroupItem value="bulletList" aria-label="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} data-state={editor.isActive('bulletList') ? 'on' : 'off'}>
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="orderedList" aria-label="Ordered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} data-state={editor.isActive('orderedList') ? 'on' : 'off'}>
            <ListOrdered className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => {
              const previousUrl = editor.getAttributes('link').href
              const url = window.prompt('URL', previousUrl)
              if (url === null) return
              if (url === '') {
                editor.chain().focus().extendMarkRange('link').unsetLink().run()
                return
              }
              editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
            }} 
            data-state={editor.isActive('link') ? 'on' : 'off'}
            title="Insert Link"
          >
            <Link2 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0"
            onClick={onOpenImageDialog}
            title="Insert Image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const [mode, setMode] = useState<EditorMode>('editor')
  const [sourceContent, setSourceContent] = useState(value)
  const [markdownContent, setMarkdownContent] = useState('')
  const [markdownPreview, setMarkdownPreview] = useState(value)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [imageTab, setImageTab] = useState<'url' | 'file'>('url')
  const [imageUrl, setImageUrl] = useState('')
  const [imageAltText, setImageAltText] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isInsertingImage, setIsInsertingImage] = useState(false)

  const turndown = useMemo(() => {
    const service = new TurndownService({ headingStyle: 'atx' })
    service.addRule('lineBreaks', {
      filter: ['br'],
      replacement: () => '  \n',
    })
    return service
  }, [])

  const editorExtensions = useMemo(
    () => [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        link: false,
        underline: false,
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
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      Image,
    ],
    [],
  )

  const convertMarkdownToHtml = useCallback((markdown: string) => {
    const parsed = marked.parse(markdown, { breaks: true })
    return typeof parsed === 'string' && parsed.length > 0 ? parsed : markdown
  }, [])

  const htmlToMd = useCallback((html: string) => turndown.turndown(html), [turndown])

  const resetImageDialog = useCallback(() => {
    setImageTab('url')
    setImageUrl('')
    setImageAltText('')
    setImageFile(null)
  }, [])

  const fileToDataUrl = useCallback((file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (event) => reject(event)
      reader.readAsDataURL(file)
    })
  }, [])

  const isInsertImageDisabled = useMemo(
    () => (imageTab === 'url' ? imageUrl.trim().length === 0 : !imageFile),
    [imageFile, imageTab, imageUrl],
  )

  const editor = useEditor({
    extensions: editorExtensions,
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base focus:outline-none max-w-none min-h-[150px] px-4 py-3',
      },
    },
    onUpdate: ({ editor }) => {
      if (mode === 'editor') {
        onChange(editor.getHTML())
      }
    },
  })

  const handleInsertImage = useCallback(async () => {
    if (!editor || isInsertImageDisabled) return

    setIsInsertingImage(true)

    try {
      let src = ''

      if (imageTab === 'url') {
        src = imageUrl.trim()
      } else if (imageFile) {
        src = await fileToDataUrl(imageFile)
      }

      if (!src) return

      editor
        .chain()
        .focus()
        .setImage({ src, alt: imageAltText.trim() || undefined })
        .run()

      setIsImageDialogOpen(false)
      resetImageDialog()
    } finally {
      setIsInsertingImage(false)
    }
  }, [editor, fileToDataUrl, imageAltText, imageFile, imageTab, imageUrl, isInsertImageDisabled, resetImageDialog])

  useEffect(() => {
    if (editor && mode === 'editor' && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor, mode])

  useEffect(() => {
    if (mode !== 'source') {
      setSourceContent(value)
    }
    if (mode !== 'markdown') {
      const md = htmlToMd(value)
      setMarkdownContent(md)
      setMarkdownPreview(value)
    }
  }, [value, mode, htmlToMd])

  const handleModeChange = useCallback(
    (nextMode: EditorMode) => {
      if (!editor || mode === nextMode) return

      if (mode === 'source') {
        editor.commands.setContent(sourceContent)
      }

      if (mode === 'markdown') {
        const htmlFromMarkdown = convertMarkdownToHtml(markdownContent)
        editor.commands.setContent(htmlFromMarkdown)
        setSourceContent(htmlFromMarkdown)
        onChange(htmlFromMarkdown)
      }

      if (nextMode === 'source') {
        setSourceContent(editor.getHTML())
      }

      if (nextMode === 'markdown') {
        const md = htmlToMd(editor.getHTML())
        setMarkdownContent(md)
        const htmlOutput = convertMarkdownToHtml(md)
        setMarkdownPreview(htmlOutput)
      }

      setMode(nextMode)
    },
    [convertMarkdownToHtml, editor, htmlToMd, markdownContent, mode, onChange, sourceContent],
  )

  const handleMarkdownChange = useCallback(
    (nextValue: string) => {
      setMarkdownContent(nextValue)
      const htmlOutput = convertMarkdownToHtml(nextValue)
      setMarkdownPreview(htmlOutput)
      onChange(htmlOutput)
    },
    [convertMarkdownToHtml, onChange],
  )

  if (!editor) return null

  return (
    <div className={cn("flex flex-col w-full rounded-3xl border border-input bg-background shadow-sm", className)}>
      <Tabs value={mode} onValueChange={(val: string) => handleModeChange(val as EditorMode)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 rounded-lg bg-muted p-1 text-muted-foreground">
          <TabsTrigger value="editor" className="rounded-md">Editor</TabsTrigger>
          <TabsTrigger value="source" className="rounded-md">Source</TabsTrigger>
          <TabsTrigger value="markdown" className="rounded-md">Markdown</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-2 space-y-2 focus-visible:outline-none focus-visible:ring-0">
          {mode === 'editor' && (
            <>
              <EditorToolbar editor={editor} mode={mode} onOpenImageDialog={() => setIsImageDialogOpen(true)} />
              <div className="relative min-h-[150px] bg-background">
                <EditorContent editor={editor} className="h-full" />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="source" className="mt-2 focus-visible:outline-none focus-visible:ring-0">
          {mode === 'source' && (
            <div className="relative min-h-[150px] bg-background">
              <Textarea
                value={sourceContent}
                onChange={(event) => {
                  const nextValue = event.target.value
                  setSourceContent(nextValue)
                  onChange(nextValue)
                }}
                className="min-h-[150px] w-full border-0 bg-transparent font-mono text-sm shadow-none focus-visible:ring-0 resize-none p-4"
                placeholder="Edit raw HTML..."
                spellCheck={false}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="markdown" className="mt-2 focus-visible:outline-none focus-visible:ring-0">
          {mode === 'markdown' && (
            <div className="relative min-h-[150px] bg-background">
              <div className="grid min-h-[150px] gap-0 md:grid-cols-2 h-full">
                <Textarea
                  value={markdownContent}
                  onChange={(event) => handleMarkdownChange(event.target.value)}
                  className="h-full w-full border-0 border-r rounded-none bg-transparent font-mono text-sm shadow-none focus-visible:ring-0 resize-none p-4"
                  placeholder="Write Markdown..."
                />
                <div className="prose prose-sm max-w-none p-4 overflow-auto bg-muted/10">
                  <div dangerouslySetInnerHTML={{ __html: markdownPreview }} />
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={isImageDialogOpen}
        onOpenChange={(open) => {
          setIsImageDialogOpen(open)
          if (!open) {
            setIsInsertingImage(false)
            resetImageDialog()
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription>Add an external URL or upload a file to embed an image.</DialogDescription>
          </DialogHeader>

          <Tabs value={imageTab} onValueChange={(val: string) => setImageTab(val as 'url' | 'file')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-lg bg-muted p-1 text-muted-foreground">
              <TabsTrigger value="url" className="rounded-md">URL</TabsTrigger>
              <TabsTrigger value="file" className="rounded-md">File</TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="mt-4 space-y-4 focus-visible:outline-none focus-visible:ring-0">
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  placeholder="i.e. https://source.unsplash.com/random"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  autoComplete="off"
                />
              </div>
            </TabsContent>

            <TabsContent value="file" className="mt-4 space-y-4 focus-visible:outline-none focus-visible:ring-0">
              <div className="space-y-2">
                <Label htmlFor="image-file">Upload image</Label>
                <Input
                  id="image-file"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null
                    setImageFile(file)
                  }}
                />
                {imageFile && <p className="text-xs text-muted-foreground">{imageFile.name}</p>}
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="image-alt">Alt Text</Label>
            <Input
              id="image-alt"
              placeholder="Random unsplash image"
              value={imageAltText}
              onChange={(event) => setImageAltText(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetImageDialog()
                setIsImageDialogOpen(false)
              }}
              disabled={isInsertingImage}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleInsertImage} disabled={isInsertImageDisabled || isInsertingImage}>
              {isInsertingImage ? 'Inserting…' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

