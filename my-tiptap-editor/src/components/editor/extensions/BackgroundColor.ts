import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        backgroundColor: {
            setBackgroundColor: (backgroundColor: string) => ReturnType
            unsetBackgroundColor: () => ReturnType
        }
    }
}

const getInlineStyleValue = (element: HTMLElement, names: string[]) => {
    const style = element.getAttribute('style')
    if (!style) return null

    const declarations = style
        .split(';')
        .map((declaration) => declaration.trim())
        .filter(Boolean)

    for (let index = declarations.length - 1; index >= 0; index -= 1) {
        const [rawProperty, ...rawValue] = declarations[index].split(':')
        const property = rawProperty?.trim().toLowerCase()
        const value = rawValue.join(':').trim()

        if (property && value && names.includes(property)) {
            return value.replace(/['"]+/g, '')
        }
    }

    return null
}

export const BackgroundColor = Extension.create({
    name: 'backgroundColor',

    addOptions() {
        return {
            types: ['textStyle'],
        }
    },

    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    backgroundColor: {
                        default: null,
                        parseHTML: (element: HTMLElement) => {
                            return (
                                getInlineStyleValue(element, ['background-color', 'background']) ||
                                element.style.backgroundColor?.replace(/['"]+/g, '') ||
                                null
                            )
                        },
                        renderHTML: (attributes: Record<string, unknown>) => {
                            if (!attributes.backgroundColor) {
                                return {}
                            }

                            return {
                                style: `background-color: ${attributes.backgroundColor}`,
                            }
                        },
                    },
                },
            },
        ]
    },

    addCommands() {
        return {
            setBackgroundColor:
                (backgroundColor: string) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ({ chain }: any) => {
                        return chain().setMark('textStyle', { backgroundColor }).run()
                    },
            unsetBackgroundColor:
                () =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ({ chain }: any) => {
                        return chain().setMark('textStyle', { backgroundColor: null }).removeEmptyTextStyle().run()
                    },
        }
    },
})
