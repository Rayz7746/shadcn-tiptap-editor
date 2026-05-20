import { mergeAttributes, Node } from '@tiptap/core'

export const Center = Node.create({
    name: 'center',

    group: 'block',

    content: 'block*',

    parseHTML() {
        return [
            {
                tag: 'center',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['center', mergeAttributes(HTMLAttributes), 0]
    },
})
