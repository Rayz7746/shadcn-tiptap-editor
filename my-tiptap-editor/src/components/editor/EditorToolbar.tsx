import { type Editor } from '@tiptap/react'
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    Highlighter,
    Image as ImageIcon,
    Italic,
    Link2,
    Link2Off,
    List,
    ListOrdered,
    Minus,
    Palette,
    Pilcrow,
    Quote,
    Redo,
    RemoveFormatting,
    Strikethrough,
    Subscript,
    Superscript,
    Underline as UnderlineIcon,
    Undo,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useState } from 'react'

interface EditorToolbarProps {
    editor: Editor | null
    disabled?: boolean
}

const FONT_SIZES = [
    '8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px',
    '20px', '24px', '28px', '32px', '36px', '48px', '72px'
]

const FONT_FAMILIES = [
    { label: 'Default', value: '' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: 'Times New Roman, serif' },
    { label: 'Courier New', value: 'Courier New, monospace' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Roboto', value: 'Roboto, sans-serif' },
]

const TEXT_COLORS = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
]

const HIGHLIGHT_COLORS = [
    '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#0000ff', '#ff0000', '#000080', '#008080', '#00ff00', '#800080',
]

// Toolbar button component
function ToolbarButton({
    onClick,
    isActive = false,
    disabled = false,
    tooltip,
    children,
    className,
}: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    tooltip: string
    children: React.ReactNode
    className?: string
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Toggle
                    size="sm"
                    pressed={isActive}
                    onPressedChange={onClick}
                    disabled={disabled}
                    aria-label={tooltip}
                    className={cn('h-8 w-8 p-0', className)}
                >
                    {children}
                </Toggle>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
                {tooltip}
            </TooltipContent>
        </Tooltip>
    )
}

export function EditorToolbar({ editor, disabled = false }: EditorToolbarProps) {
    const [linkDialogOpen, setLinkDialogOpen] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')
    const [imageDialogOpen, setImageDialogOpen] = useState(false)
    const [imageUrl, setImageUrl] = useState('')
    const [imageAlt, setImageAlt] = useState('')

    if (!editor) return null

    const handleInsertLink = () => {
        if (linkUrl) {
            editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({ href: linkUrl })
                .run()
        }
        setLinkUrl('')
        setLinkDialogOpen(false)
    }

    const handleRemoveLink = () => {
        editor.chain().focus().unsetLink().run()
    }

    const handleInsertImage = () => {
        if (imageUrl) {
            editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run()
        }
        setImageUrl('')
        setImageAlt('')
        setImageDialogOpen(false)
    }


    const getCurrentHeading = () => {
        for (let i = 1; i <= 6; i++) {
            if (editor.isActive('heading', { level: i })) return `h${i}`
        }
        return 'p'
    }

    const handleHeadingChange = (value: string) => {
        if (value === 'p') {
            editor.chain().focus().setParagraph().run()
        } else {
            const level = parseInt(value.replace('h', '')) as 1 | 2 | 3 | 4 | 5 | 6
            editor.chain().focus().toggleHeading({ level }).run()
        }
    }

    const handleFontSizeChange = (value: string) => {
        if (value) {
            editor.chain().focus().setFontSize(value).run()
        } else {
            editor.chain().focus().unsetFontSize().run()
        }
    }

    const handleFontFamilyChange = (value: string) => {
        if (value && value !== 'default') {
            editor.chain().focus().setFontFamily(value).run()
        } else {
            editor.chain().focus().unsetFontFamily().run()
        }
    }

    const removeFormatting = () => {
        editor.chain().focus().clearNodes().unsetAllMarks().unsetTextAlign().run()
    }

    return (
        <TooltipProvider delayDuration={300}>
            <div className="border-b bg-muted/30">
                {/* Row 1: Undo/Redo, Format, Font */}
                <div className="flex flex-wrap items-center gap-0.5 p-1 border-b border-border/50">
                    {/* Undo/Redo */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={disabled || !editor.can().undo()}
                        tooltip="Undo (Ctrl+Z)"
                    >
                        <Undo className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={disabled || !editor.can().redo()}
                        tooltip="Redo (Ctrl+Y)"
                    >
                        <Redo className="h-4 w-4" />
                    </ToolbarButton>

                    <Separator orientation="vertical" className="mx-1 h-6" />

                    {/* Block Format */}
                    <Select value={getCurrentHeading()} onValueChange={handleHeadingChange} disabled={disabled}>
                        <SelectTrigger className="h-8 w-[130px] text-xs">
                            <SelectValue placeholder="Format" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="p">
                                <div className="flex items-center gap-2">
                                    <Pilcrow className="h-4 w-4" />
                                    <span>Paragraph</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="h1">
                                <div className="flex items-center gap-2">
                                    <Heading1 className="h-4 w-4" />
                                    <span>Heading 1</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="h2">
                                <div className="flex items-center gap-2">
                                    <Heading2 className="h-4 w-4" />
                                    <span>Heading 2</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="h3">
                                <div className="flex items-center gap-2">
                                    <Heading3 className="h-4 w-4" />
                                    <span>Heading 3</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="h4">
                                <div className="flex items-center gap-2">
                                    <Heading4 className="h-4 w-4" />
                                    <span>Heading 4</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="h5">
                                <div className="flex items-center gap-2">
                                    <Heading5 className="h-4 w-4" />
                                    <span>Heading 5</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="h6">
                                <div className="flex items-center gap-2">
                                    <Heading6 className="h-4 w-4" />
                                    <span>Heading 6</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Separator orientation="vertical" className="mx-1 h-6" />

                    {/* Font Family */}
                    <Select
                        value={editor.getAttributes('textStyle').fontFamily || 'default'}
                        onValueChange={handleFontFamilyChange}
                        disabled={disabled}
                    >
                        <SelectTrigger className="h-8 w-[120px] text-xs">
                            <SelectValue placeholder="Font" />
                        </SelectTrigger>
                        <SelectContent>
                            {FONT_FAMILIES.map((font) => (
                                <SelectItem key={font.value} value={font.value || 'default'}>
                                    <span style={{ fontFamily: font.value || 'inherit' }}>{font.label}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Font Size */}
                    <Select
                        value={editor.getAttributes('textStyle').fontSize || ''}
                        onValueChange={handleFontSizeChange}
                        disabled={disabled}
                    >
                        <SelectTrigger className="h-8 w-[80px] text-xs">
                            <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                            {FONT_SIZES.map((size) => (
                                <SelectItem key={size} value={size}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Separator orientation="vertical" className="mx-1 h-6" />

                    {/* Text Color */}
                    <Popover>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        disabled={disabled}
                                        aria-label="Text Color"
                                    >
                                        <div className="flex flex-col items-center">
                                            <Palette className="h-4 w-4" />
                                            <div
                                                className="h-0.5 w-4 mt-0.5"
                                                style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000' }}
                                            />
                                        </div>
                                    </Button>
                                </PopoverTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Text Color</TooltipContent>
                        </Tooltip>
                        <PopoverContent className="w-auto p-2">
                            <div className="grid grid-cols-10 gap-1">
                                {TEXT_COLORS.map((color) => (
                                    <button
                                        type="button"
                                        key={color}
                                        aria-label={`Set text color ${color}`}
                                        className="h-5 w-5 rounded border border-border hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color }}
                                        onClick={() => editor.chain().focus().setColor(color).run()}
                                    />
                                ))}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-2 text-xs"
                                onClick={() => editor.chain().focus().unsetColor().run()}
                            >
                                Remove Color
                            </Button>
                        </PopoverContent>
                    </Popover>

                    {/* Highlight Color */}
                    <Popover>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        disabled={disabled}
                                        aria-label="Highlight Color"
                                    >
                                        <Highlighter className="h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>
                            </TooltipTrigger>
                            <TooltipContent>Highlight Color</TooltipContent>
                        </Tooltip>
                        <PopoverContent className="w-auto p-2">
                            <div className="grid grid-cols-5 gap-1">
                                {HIGHLIGHT_COLORS.map((color, index) => (
                                    <button
                                        type="button"
                                        key={`${color}-${index}`}
                                        aria-label={`Set highlight color ${color}`}
                                        className="h-5 w-5 rounded border border-border hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color }}
                                        onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                                    />
                                ))}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full mt-2 text-xs"
                                onClick={() => editor.chain().focus().unsetHighlight().run()}
                            >
                                Remove Highlight
                            </Button>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Row 2: Text formatting, alignment, lists, insert */}
                <div className="flex flex-wrap items-center gap-0.5 p-1">
                    {/* Text formatting */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        disabled={disabled}
                        tooltip="Bold (Ctrl+B)"
                    >
                        <Bold className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        disabled={disabled}
                        tooltip="Italic (Ctrl+I)"
                    >
                        <Italic className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                        disabled={disabled}
                        tooltip="Underline (Ctrl+U)"
                    >
                        <UnderlineIcon className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        disabled={disabled}
                        tooltip="Strikethrough"
                    >
                        <Strikethrough className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleSubscript().run()}
                        isActive={editor.isActive('subscript')}
                        disabled={disabled}
                        tooltip="Subscript"
                    >
                        <Subscript className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleSuperscript().run()}
                        isActive={editor.isActive('superscript')}
                        disabled={disabled}
                        tooltip="Superscript"
                    >
                        <Superscript className="h-4 w-4" />
                    </ToolbarButton>

                    <Separator orientation="vertical" className="mx-1 h-6" />

                    {/* Alignment */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        isActive={editor.isActive({ textAlign: 'left' })}
                        disabled={disabled}
                        tooltip="Align Left"
                    >
                        <AlignLeft className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        isActive={editor.isActive({ textAlign: 'center' })}
                        disabled={disabled}
                        tooltip="Align Center"
                    >
                        <AlignCenter className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        isActive={editor.isActive({ textAlign: 'right' })}
                        disabled={disabled}
                        tooltip="Align Right"
                    >
                        <AlignRight className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        isActive={editor.isActive({ textAlign: 'justify' })}
                        disabled={disabled}
                        tooltip="Justify"
                    >
                        <AlignJustify className="h-4 w-4" />
                    </ToolbarButton>

                    <Separator orientation="vertical" className="mx-1 h-6" />

                    {/* Lists */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        disabled={disabled}
                        tooltip="Bullet List"
                    >
                        <List className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        disabled={disabled}
                        tooltip="Numbered List"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </ToolbarButton>

                    <Separator orientation="vertical" className="mx-1 h-6" />

                    {/* Block elements */}
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        disabled={disabled}
                        tooltip="Quote"
                    >
                        <Quote className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        isActive={editor.isActive('codeBlock')}
                        disabled={disabled}
                        tooltip="Code Block"
                    >
                        <Code className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        disabled={disabled}
                        tooltip="Horizontal Rule"
                    >
                        <Minus className="h-4 w-4" />
                    </ToolbarButton>

                    <Separator orientation="vertical" className="mx-1 h-6" />

                    {/* Link */}
                    <ToolbarButton
                        onClick={() => {
                            const previousUrl = editor.getAttributes('link').href
                            setLinkUrl(previousUrl || '')
                            setLinkDialogOpen(true)
                        }}
                        isActive={editor.isActive('link')}
                        disabled={disabled}
                        tooltip="Insert Link"
                    >
                        <Link2 className="h-4 w-4" />
                    </ToolbarButton>
                    {editor.isActive('link') && (
                        <ToolbarButton
                            onClick={handleRemoveLink}
                            disabled={disabled}
                            tooltip="Remove Link"
                        >
                            <Link2Off className="h-4 w-4" />
                        </ToolbarButton>
                    )}

                    {/* Image */}
                    <ToolbarButton
                        onClick={() => setImageDialogOpen(true)}
                        disabled={disabled}
                        tooltip="Insert Image"
                    >
                        <ImageIcon className="h-4 w-4" />
                    </ToolbarButton>


                    <Separator orientation="vertical" className="mx-1 h-6" />

                    {/* Remove formatting */}
                    <ToolbarButton
                        onClick={removeFormatting}
                        disabled={disabled}
                        tooltip="Remove Formatting"
                    >
                        <RemoveFormatting className="h-4 w-4" />
                    </ToolbarButton>
                </div>
            </div>

            {/* Link Dialog */}
            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Insert Link</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="link-url">URL</Label>
                            <Input
                                id="link-url"
                                type="url"
                                placeholder="https://example.com"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleInsertLink()
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setLinkDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleInsertLink}>Insert</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Dialog */}
            <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Insert Image</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="image-url">Image URL</Label>
                            <Input
                                id="image-url"
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image-alt">Alt Text (optional)</Label>
                            <Input
                                id="image-alt"
                                type="text"
                                placeholder="Image description"
                                value={imageAlt}
                                onChange={(e) => setImageAlt(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleInsertImage()
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setImageDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleInsertImage}>Insert</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    )
}
