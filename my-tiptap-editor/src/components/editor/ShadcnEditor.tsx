import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { marked } from 'marked'
import TurndownService from 'turndown'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { EditorToolbar } from './EditorToolbar'
import { BackgroundColor, Center, FontSize, FontFamily } from './extensions'

type EditorMode = 'editor' | 'markdown' | 'source'

const VOID_TAGS = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
])

const INLINE_TAGS = new Set([
    'a',
    'b',
    'br',
    'code',
    'em',
    'i',
    'mark',
    'small',
    'span',
    'strong',
    'sub',
    'sup',
    'u',
])

const isHtmlStructurallyValid = (html: string) => {
    const stack: string[] = []
    let index = 0

    while (index < html.length) {
        const open = html.indexOf('<', index)
        if (open === -1) return stack.length === 0

        const close = html.indexOf('>', open + 1)
        if (close === -1) return false

        const rawTag = html.slice(open + 1, close).trim()
        if (!rawTag) return false

        if (rawTag.startsWith('!--')) {
            const commentEnd = html.indexOf('-->', open + 4)
            if (commentEnd === -1) return false
            index = commentEnd + 3
            continue
        }

        if (rawTag.startsWith('!') || rawTag.startsWith('?')) {
            index = close + 1
            continue
        }

        const isClosingTag = rawTag.startsWith('/')
        const tagName = rawTag
            .replace(/^\//, '')
            .split(/\s+/)[0]
            ?.replace(/\/$/, '')
            .toLowerCase()

        if (!tagName) return false

        if (isClosingTag) {
            if (VOID_TAGS.has(tagName)) {
                index = close + 1
                continue
            }

            if (stack.pop() !== tagName) return false
        } else if (!VOID_TAGS.has(tagName) && !rawTag.endsWith('/')) {
            stack.push(tagName)
        }

        index = close + 1
    }

    return stack.length === 0
}

const formatHtml = (html: string) => {
    if (!isHtmlStructurallyValid(html)) return html

    const tokens = html
        .replace(/>\s+</g, '><')
        .match(/<[^>]+>|[^<]+/g)

    if (!tokens) return html

    const lines: string[] = []
    let indent = 0

    const appendLine = (line: string, level = indent) => {
        const trimmed = line.trim()
        if (trimmed) {
            lines.push(`${'  '.repeat(Math.max(level, 0))}${trimmed}`)
        }
    }

    tokens.forEach((token) => {
        const trimmed = token.trim()
        if (!trimmed) return

        if (!trimmed.startsWith('<')) {
            appendLine(trimmed)
            return
        }

        const tagName = trimmed
            .replace(/^<\//, '')
            .replace(/^</, '')
            .split(/\s|>/)[0]
            ?.replace(/\/$/, '')
            .toLowerCase()

        const isClosingTag = trimmed.startsWith('</')
        const isSelfClosing = trimmed.endsWith('/>') || VOID_TAGS.has(tagName)
        const isInlineTag = INLINE_TAGS.has(tagName)

        if (isClosingTag && !isInlineTag) {
            indent -= 1
        }

        appendLine(trimmed)

        if (!isClosingTag && !isSelfClosing && !isInlineTag) {
            indent += 1
        }
    })

    return lines.join('\n')
}

interface ShadcnEditorProps {
    value: string
    onChange: (value: string) => void
    className?: string
    placeholder?: string
    minHeight?: string
}

// Configure turndown to preserve more HTML
const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    strongDelimiter: '**',
})

// Keep certain HTML elements as-is in markdown (passthrough)
turndownService.addRule('preserveCenter', {
    filter: (node: Node) => node.nodeName === 'CENTER',
    replacement: function (_content: string, node: Node) {
        return (node as HTMLElement).outerHTML
    },
})

turndownService.addRule('preserveInlineStyles', {
    filter: function (node: Node) {
        const element = node as HTMLElement
        // Check if the element has inline styles that we want to preserve
        return !!(element.style && element.style.cssText && (
            element.style.color ||
            element.style.backgroundColor ||
            element.style.fontSize ||
            element.style.fontFamily ||
            element.style.textAlign
        ))
    },
    replacement: function (_content: string, node: Node) {
        return (node as HTMLElement).outerHTML
    },
})

turndownService.addRule('preserveSpanWithClass', {
    filter: function (node: Node) {
        return node.nodeName === 'SPAN' && (node as HTMLElement).className !== ''
    },
    replacement: function (_content: string, node: Node) {
        return (node as HTMLElement).outerHTML
    },
})

// Configure marked for HTML output
marked.setOptions({
    breaks: true,
    gfm: true,
})

export function ShadcnEditor({
    value,
    onChange,
    className,
    placeholder = 'Start typing...',
    minHeight = '300px',
}: ShadcnEditorProps) {
    const [mode, setMode] = useState<EditorMode>('editor')
    const modeRef = useRef<EditorMode>('editor')
    const [rawHtml, setRawHtml] = useState(value)
    const [markdownContent, setMarkdownContent] = useState('')
    const [isMarkdownDirty, setIsMarkdownDirty] = useState(false)
    const [invalidSourceHtml, setInvalidSourceHtml] = useState<string | null>(
        isHtmlStructurallyValid(value) ? null : value
    )
    const lastEditorValueRef = useRef(value)

    useEffect(() => {
        modeRef.current = mode
    }, [mode])

    // Convert HTML to Markdown
    const htmlToMarkdown = useCallback((html: string): string => {
        try {
            return turndownService.turndown(html)
        } catch (error) {
            console.error('HTML to Markdown conversion error:', error)
            return html
        }
    }, [])

    // Convert Markdown to HTML
    const markdownToHtml = useCallback((md: string): string => {
        try {
            return marked.parse(md, { async: false }) as string
        } catch (error) {
            console.error('Markdown to HTML conversion error:', error)
            return md
        }
    }, [])

    // Tiptap extensions configuration
    const extensions = useMemo(
        () => [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            Underline,
            Center,
            TextStyle,
            Color,
            BackgroundColor,
            FontSize,
            FontFamily,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
            }),
            Highlight.configure({
                multicolor: true,
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'editor-image',
                },
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                HTMLAttributes: {
                    class: 'editor-link',
                },
            }),
            Subscript,
            Superscript,
        ],
        []
    )

    // Initialize editor
    const editor = useEditor({
        extensions,
        content: value,
        editorProps: {
            attributes: {
                class: cn(
                    'prose prose-sm sm:prose-base max-w-none',
                    'focus:outline-none',
                    'px-4 py-3'
                ),
                style: `min-height: ${minHeight}`,
                'data-placeholder': placeholder,
            },
        },
        onUpdate: ({ editor }) => {
            if (modeRef.current === 'editor') {
                const html = formatHtml(editor.getHTML())
                lastEditorValueRef.current = html
                onChange(html)
            }
        },
    })

    const setEditorContent = useCallback(
        (html: string) => {
            if (!isHtmlStructurallyValid(html)) {
                setInvalidSourceHtml(html)
                return
            }

            setInvalidSourceHtml(null)

            if (!editor || html === editor.getHTML()) return

            try {
                editor.commands.setContent(html, { emitUpdate: false })
            } catch (error) {
                console.error('Editor content sync error:', error)
            }
        },
        [editor]
    )

    // The parent value is the durable state. Only sync the external Tiptap editor
    // while Editor mode is active; Source/Markdown buffers are prepared on tab entry.
    useEffect(() => {
        if (mode === 'editor' && value !== lastEditorValueRef.current) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setEditorContent(value)
        }
    }, [value, mode, setEditorContent])

    const getCurrentHtml = useCallback(() => {
        if (mode === 'source') {
            return rawHtml
        }

        if (mode === 'markdown') {
            if (!isMarkdownDirty) {
                return value
            }

            return markdownToHtml(markdownContent)
        }

        return value
    }, [isMarkdownDirty, markdownContent, markdownToHtml, mode, rawHtml, value])

    // Handle mode switching
    const handleModeChange = useCallback(
        (newMode: EditorMode) => {
            if (newMode === mode) return

            const currentHtml = getCurrentHtml()

            if (currentHtml !== value) {
                onChange(currentHtml)
            }

            if (newMode === 'source') {
                setRawHtml(formatHtml(currentHtml))
            } else if (newMode === 'markdown') {
                setMarkdownContent(htmlToMarkdown(currentHtml))
                setIsMarkdownDirty(false)
                setEditorContent(currentHtml)
            } else {
                setEditorContent(currentHtml)
            }

            setMode(newMode)
        },
        [getCurrentHtml, htmlToMarkdown, mode, onChange, setEditorContent, value]
    )

    // Handle source content changes
    const handleSourceChange = useCallback(
        (newSource: string) => {
            setRawHtml(newSource)
            onChange(newSource)
        },
        [onChange]
    )

    // Handle markdown content changes
    const handleMarkdownChange = useCallback(
        (newMarkdown: string) => {
            setMarkdownContent(newMarkdown)
            setIsMarkdownDirty(true)
            onChange(markdownToHtml(newMarkdown))
        },
        [markdownToHtml, onChange]
    )

    if (!editor) {
        return (
            <div
                className={cn(
                    'flex items-center justify-center rounded-md border bg-background',
                    className
                )}
                style={{ minHeight }}
            >
                <span className="text-muted-foreground text-sm">Loading editor...</span>
            </div>
        )
    }

    return (
        <div className={cn('rounded-md border bg-background shadow-sm', className)}>
            <Tabs
                value={mode}
                onValueChange={(v) => handleModeChange(v as EditorMode)}
            >
                {/* Mode Tabs */}
                <div className="flex items-center justify-between border-b bg-muted/40 px-1">
                    <TabsList className="h-9 bg-transparent p-0">
                        <TabsTrigger
                            value="editor"
                            className="rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                            Editor
                        </TabsTrigger>
                        <TabsTrigger
                            value="markdown"
                            className="rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                            Markdown
                        </TabsTrigger>
                        <TabsTrigger
                            value="source"
                            className="rounded-none border-b-2 border-transparent px-4 py-2 text-sm font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                        >
                            Source
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Editor Mode */}
                <TabsContent value="editor" className="m-0">
                    {invalidSourceHtml ? (
                        <>
                            <EditorToolbar editor={editor} disabled />
                            <pre
                                className="m-0 overflow-auto whitespace-pre-wrap break-words px-4 py-3 font-mono text-sm text-destructive"
                                style={{ minHeight }}
                            >
                                <code>{invalidSourceHtml}</code>
                            </pre>
                        </>
                    ) : (
                        <>
                            <EditorToolbar editor={editor} disabled={mode !== 'editor'} />
                            <EditorContent
                                editor={editor}
                                className="editor-content"
                            />
                        </>
                    )}
                </TabsContent>

                {/* Markdown Mode */}
                <TabsContent value="markdown" className="m-0">
                    <div className="border-b bg-muted/30 px-3 py-2">
                        <p className="text-xs text-muted-foreground">
                            Edit in Markdown. The saved value updates as HTML while you type.
                        </p>
                    </div>
                    <Textarea
                        value={markdownContent}
                        onChange={(e) => handleMarkdownChange(e.target.value)}
                        className="min-h-[400px] resize-none rounded-none border-0 font-mono text-sm focus-visible:ring-0"
                        style={{ minHeight }}
                        placeholder="Enter Markdown here..."
                    />
                </TabsContent>

                {/* Source Mode */}
                <TabsContent value="source" className="m-0">
                    <div className="border-b bg-muted/30 px-3 py-2">
                        <p className="text-xs text-muted-foreground">
                            Edit raw HTML source directly. Broken or partial HTML stays untouched while you type.
                        </p>
                    </div>
                    <Textarea
                        value={rawHtml}
                        onChange={(e) => handleSourceChange(e.target.value)}
                        className="min-h-[400px] resize-none rounded-none border-0 font-mono text-sm focus-visible:ring-0"
                        style={{ minHeight }}
                        placeholder="Enter HTML source here..."
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default ShadcnEditor
