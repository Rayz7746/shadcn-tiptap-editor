import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        fontFamily: {
            setFontFamily: (fontFamily: string) => ReturnType
            unsetFontFamily: () => ReturnType
        }
    }
}

export const FontFamily = Extension.create({
    name: 'fontFamily',

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
                    fontFamily: {
                        default: null,
                        parseHTML: (element: HTMLElement) => element.style.fontFamily?.replace(/['"]+/g, '') || null,
                        renderHTML: (attributes: Record<string, unknown>) => {
                            if (!attributes.fontFamily) {
                                return {}
                            }
                            return {
                                style: `font-family: ${attributes.fontFamily}`,
                            }
                        },
                    },
                },
            },
        ]
    },

    addCommands() {
        return {
            setFontFamily:
                (fontFamily: string) =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ({ chain }: any) => {
                        return chain().setMark('textStyle', { fontFamily }).run()
                    },
            unsetFontFamily:
                () =>
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ({ chain }: any) => {
                        return chain().setMark('textStyle', { fontFamily: null }).removeEmptyTextStyle().run()
                    },
        }
    },
})
