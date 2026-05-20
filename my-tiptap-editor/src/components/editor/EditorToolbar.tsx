import { useState, type ReactNode } from 'react'
import { type Editor } from '@tiptap/react'
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    Code,
    Highlighter,
    Image as ImageIcon,
    Italic,
    Link2,
    Link2Off,
    List,
    ListOrdered,
    Minus,
    Palette,
    Quote,
    Redo,
    RemoveFormatting,
    Strikethrough,
    Subscript,
    Superscript,
    Underline as UnderlineIcon,
    Undo,
} from 'lucide-react'

interface EditorToolbarProps {
    editor: Editor | null
    disabled?: boolean
}

const FONT_SIZES = [
    '8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px',
    '20px', '24px', '28px', '32px', '36px', '48px', '72px',
]

const FONT_FAMILIES = [
    { label: 'Default', value: 'default' },
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
    '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#0000ff', '#ff0000', '#000080', '#008080', '#800080',
]

function ToolbarButton({
    onClick,
    isActive = false,
    disabled = false,
    tooltip,
    children,
}: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    tooltip: string
    children: ReactNode
}) {
    return (
        <button
            type="button"
            className="se-toolbar-button"
            data-active={isActive ? 'true' : undefined}
            disabled={disabled}
            title={tooltip}
            aria-label={tooltip}
            onClick={onClick}
        >
            {children}
        </button>
    )
}

function ToolbarDivider() {
    return <div className="se-toolbar-divider" aria-hidden="true" />
}

function ColorPopover({
    label,
    disabled,
    children,
    colors,
    onSelect,
    onClear,
}: {
    label: string
    disabled?: boolean
    children: ReactNode
    colors: string[]
    onSelect: (color: string) => void
    onClear: () => void
}) {
    const [open, setOpen] = useState(false)

    return (
        <div className="se-popover">
            <button
                type="button"
                className="se-toolbar-button"
                disabled={disabled}
                title={label}
                aria-label={label}
                onClick={() => setOpen((current) => !current)}
            >
                {children}
            </button>
            {open && (
                <div className="se-popover-content">
                    <div className="se-color-grid">
                        {colors.map((color, index) => (
                            <button
                                type="button"
                                key={`${color}-${index}`}
                                className="se-color-swatch"
                                style={{ backgroundColor: color }}
                                aria-label={`${label} ${color}`}
                                onClick={() => {
                                    onSelect(color)
                                    setOpen(false)
                                }}
                            />
                        ))}
                    </div>
                    <button
                        type="button"
                        className="se-menu-button"
                        onClick={() => {
                            onClear()
                            setOpen(false)
                        }}
                    >
                        Remove {label}
                    </button>
                </div>
            )}
        </div>
    )
}

export function EditorToolbar({ editor, disabled = false }: EditorToolbarProps) {
    const [linkDialogOpen, setLinkDialogOpen] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')
    const [imageDialogOpen, setImageDialogOpen] = useState(false)
    const [imageUrl, setImageUrl] = useState('')
    const [imageAlt, setImageAlt] = useState('')

    if (!editor) return null

    const getCurrentHeading = () => {
        for (let i = 1; i <= 6; i += 1) {
            if (editor.isActive('heading', { level: i })) return `h${i}`
        }

        return 'p'
    }

    const handleHeadingChange = (value: string) => {
        if (value === 'p') {
            editor.chain().focus().setParagraph().run()
            return
        }

        const level = parseInt(value.replace('h', ''), 10) as 1 | 2 | 3 | 4 | 5 | 6
        editor.chain().focus().toggleHeading({ level }).run()
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

    const handleInsertLink = () => {
        if (linkUrl.trim()) {
            editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.trim() }).run()
        }

        setLinkUrl('')
        setLinkDialogOpen(false)
    }

    const handleRemoveLink = () => {
        editor.chain().focus().unsetLink().run()
    }

    const handleInsertImage = () => {
        if (imageUrl.trim()) {
            editor.chain().focus().setImage({ src: imageUrl.trim(), alt: imageAlt.trim() }).run()
        }

        setImageUrl('')
        setImageAlt('')
        setImageDialogOpen(false)
    }

    const removeFormatting = () => {
        editor.chain().focus().clearNodes().unsetAllMarks().unsetTextAlign().run()
    }

    return (
        <>
            <div className="se-toolbar">
                <div className="se-toolbar-row">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={disabled || !editor.can().undo()}
                        tooltip="Undo"
                    >
                        <Undo />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={disabled || !editor.can().redo()}
                        tooltip="Redo"
                    >
                        <Redo />
                    </ToolbarButton>

                    <ToolbarDivider />

                    <select
                        className="se-select se-select-wide"
                        value={getCurrentHeading()}
                        disabled={disabled}
                        aria-label="Block format"
                        onChange={(event) => handleHeadingChange(event.target.value)}
                    >
                        <option value="p">Paragraph</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                        <option value="h4">Heading 4</option>
                        <option value="h5">Heading 5</option>
                        <option value="h6">Heading 6</option>
                    </select>

                    <ToolbarDivider />

                    <select
                        className="se-select se-select-wide"
                        value={editor.getAttributes('textStyle').fontFamily || 'default'}
                        disabled={disabled}
                        aria-label="Font family"
                        onChange={(event) => handleFontFamilyChange(event.target.value)}
                    >
                        {FONT_FAMILIES.map((font) => (
                            <option key={font.value} value={font.value}>
                                {font.label}
                            </option>
                        ))}
                    </select>

                    <select
                        className="se-select"
                        value={editor.getAttributes('textStyle').fontSize || ''}
                        disabled={disabled}
                        aria-label="Font size"
                        onChange={(event) => handleFontSizeChange(event.target.value)}
                    >
                        <option value="">Size</option>
                        {FONT_SIZES.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>

                    <ToolbarDivider />

                    <ColorPopover
                        label="Text Color"
                        disabled={disabled}
                        colors={TEXT_COLORS}
                        onSelect={(color) => editor.chain().focus().setColor(color).run()}
                        onClear={() => editor.chain().focus().unsetColor().run()}
                    >
                        <span className="se-color-button">
                            <Palette />
                            <span
                                className="se-color-preview"
                                style={{ backgroundColor: editor.getAttributes('textStyle').color || 'currentColor' }}
                            />
                        </span>
                    </ColorPopover>

                    <ColorPopover
                        label="Highlight"
                        disabled={disabled}
                        colors={HIGHLIGHT_COLORS}
                        onSelect={(color) => editor.chain().focus().setBackgroundColor(color).run()}
                        onClear={() => editor.chain().focus().unsetBackgroundColor().run()}
                    >
                        <Highlighter />
                    </ColorPopover>
                </div>

                <div className="se-toolbar-row">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        disabled={disabled}
                        tooltip="Bold"
                    >
                        <Bold />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        disabled={disabled}
                        tooltip="Italic"
                    >
                        <Italic />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        isActive={editor.isActive('underline')}
                        disabled={disabled}
                        tooltip="Underline"
                    >
                        <UnderlineIcon />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        disabled={disabled}
                        tooltip="Strikethrough"
                    >
                        <Strikethrough />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleSubscript().run()}
                        isActive={editor.isActive('subscript')}
                        disabled={disabled}
                        tooltip="Subscript"
                    >
                        <Subscript />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleSuperscript().run()}
                        isActive={editor.isActive('superscript')}
                        disabled={disabled}
                        tooltip="Superscript"
                    >
                        <Superscript />
                    </ToolbarButton>

                    <ToolbarDivider />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        isActive={editor.isActive({ textAlign: 'left' })}
                        disabled={disabled}
                        tooltip="Align Left"
                    >
                        <AlignLeft />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        isActive={editor.isActive({ textAlign: 'center' })}
                        disabled={disabled}
                        tooltip="Align Center"
                    >
                        <AlignCenter />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        isActive={editor.isActive({ textAlign: 'right' })}
                        disabled={disabled}
                        tooltip="Align Right"
                    >
                        <AlignRight />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        isActive={editor.isActive({ textAlign: 'justify' })}
                        disabled={disabled}
                        tooltip="Justify"
                    >
                        <AlignJustify />
                    </ToolbarButton>

                    <ToolbarDivider />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        disabled={disabled}
                        tooltip="Bullet List"
                    >
                        <List />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        disabled={disabled}
                        tooltip="Numbered List"
                    >
                        <ListOrdered />
                    </ToolbarButton>

                    <ToolbarDivider />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        disabled={disabled}
                        tooltip="Quote"
                    >
                        <Quote />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        isActive={editor.isActive('codeBlock')}
                        disabled={disabled}
                        tooltip="Code Block"
                    >
                        <Code />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        disabled={disabled}
                        tooltip="Horizontal Rule"
                    >
                        <Minus />
                    </ToolbarButton>

                    <ToolbarDivider />

                    <ToolbarButton
                        onClick={() => {
                            setLinkUrl(editor.getAttributes('link').href || '')
                            setLinkDialogOpen(true)
                        }}
                        isActive={editor.isActive('link')}
                        disabled={disabled}
                        tooltip="Insert Link"
                    >
                        <Link2 />
                    </ToolbarButton>
                    {editor.isActive('link') && (
                        <ToolbarButton onClick={handleRemoveLink} disabled={disabled} tooltip="Remove Link">
                            <Link2Off />
                        </ToolbarButton>
                    )}
                    <ToolbarButton onClick={() => setImageDialogOpen(true)} disabled={disabled} tooltip="Insert Image">
                        <ImageIcon />
                    </ToolbarButton>

                    <ToolbarDivider />

                    <ToolbarButton onClick={removeFormatting} disabled={disabled} tooltip="Remove Formatting">
                        <RemoveFormatting />
                    </ToolbarButton>
                </div>
            </div>

            {linkDialogOpen && (
                <div className="se-dialog-backdrop" role="presentation" onMouseDown={() => setLinkDialogOpen(false)}>
                    <div className="se-dialog" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
                        <h2 className="se-dialog-title">Insert Link</h2>
                        <label className="se-field">
                            <span>URL</span>
                            <input
                                className="se-input"
                                type="url"
                                placeholder="https://example.com"
                                value={linkUrl}
                                onChange={(event) => setLinkUrl(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') handleInsertLink()
                                }}
                                autoFocus
                            />
                        </label>
                        <div className="se-dialog-actions">
                            <button type="button" className="se-menu-button" onClick={() => setLinkDialogOpen(false)}>
                                Cancel
                            </button>
                            <button type="button" className="se-primary-button" onClick={handleInsertLink}>
                                Insert
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {imageDialogOpen && (
                <div className="se-dialog-backdrop" role="presentation" onMouseDown={() => setImageDialogOpen(false)}>
                    <div className="se-dialog" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
                        <h2 className="se-dialog-title">Insert Image</h2>
                        <label className="se-field">
                            <span>Image URL</span>
                            <input
                                className="se-input"
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                value={imageUrl}
                                onChange={(event) => setImageUrl(event.target.value)}
                                autoFocus
                            />
                        </label>
                        <label className="se-field">
                            <span>Alt Text</span>
                            <input
                                className="se-input"
                                type="text"
                                placeholder="Image description"
                                value={imageAlt}
                                onChange={(event) => setImageAlt(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') handleInsertImage()
                                }}
                            />
                        </label>
                        <div className="se-dialog-actions">
                            <button type="button" className="se-menu-button" onClick={() => setImageDialogOpen(false)}>
                                Cancel
                            </button>
                            <button type="button" className="se-primary-button" onClick={handleInsertImage}>
                                Insert
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
