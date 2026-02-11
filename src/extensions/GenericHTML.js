import { Node, mergeAttributes } from '@tiptap/core'

// Generic HTML node for block-level semantic elements
export const GenericHTML = Node.create({
  name: 'genericHTML',
  
  group: 'block',
  
  content: 'block*',
  
  atom: false,
  
  addAttributes() {
    return {
      tag: {
        default: 'div',
      },
      class: {
        default: null,
      },
      style: {
        default: null,
      },
      id: {
        default: null,
      },
      // Store all other attributes
      dataAttrs: {
        default: null,
      },
    }
  },
  
  parseHTML() {
    // Accept common HTML5 semantic elements and generic containers
    return [
      { tag: 'nav' },
      { tag: 'header' },
      { tag: 'footer' },
      { tag: 'article' },
      { tag: 'section' },
      { tag: 'aside' },
      { tag: 'main' },
      { tag: 'figure' },
      { tag: 'figcaption' },
      { tag: 'div' },
    ].map(({ tag }) => ({
      tag,
      getAttrs: (el) => {
        const attrs = {
          tag,
        }
        
        // Only set attributes that actually exist and are non-empty
        const className = el.className?.trim()
        const styleText = el.style?.cssText?.trim()
        const idValue = el.id?.trim()
        
        if (className) attrs.class = className
        if (styleText) attrs.style = styleText
        if (idValue) attrs.id = idValue
        
        // Capture data-* and other attributes
        const dataAttrs = {}
        if (el.attributes) {
          Array.from(el.attributes).forEach(attr => {
            if (attr.name && (attr.name.startsWith('data-') || ['role', 'aria-label'].includes(attr.name))) {
              dataAttrs[attr.name] = attr.value || ''
            }
          })
        }
        if (Object.keys(dataAttrs).length > 0) {
          attrs.dataAttrs = dataAttrs
        }
        
        return attrs
      },
    }))
  },
  
  renderHTML({ node, HTMLAttributes }) {
    const { tag, class: className, style, id, dataAttrs } = node.attrs
    
    // Ensure tag is a valid string without special characters
    const validTag = (tag && typeof tag === 'string' && tag.trim()) || 'div'
    
    const attrs = {}
    if (className && typeof className === 'string') {
      attrs.class = className
    }
    if (style && typeof style === 'string') {
      attrs.style = style
    }
    if (id && typeof id === 'string') {
      attrs.id = id
    }
    
    // Only add dataAttrs if it's an object with keys
    if (dataAttrs && typeof dataAttrs === 'object' && Object.keys(dataAttrs).length > 0) {
      Object.assign(attrs, dataAttrs)
    }
    
    return [validTag, mergeAttributes(attrs, HTMLAttributes), 0]
  },
})
