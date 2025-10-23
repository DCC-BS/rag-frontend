# Custom Prose Components

This directory contains custom prose components that extend MDC (Markdown Components) functionality.

## ProseRef Component

The `ProseRef` component renders custom `<ref>` tags wrapped in NuxtUI tooltips.

### Usage in MDC Content

You can use the `<ref>` tag directly in your markdown content:

```markdown
Here is some text with a <ref text="This is additional information">reference</ref> in it.
```

### Props

- `text` (optional): The tooltip text to display on hover. Defaults to "Reference".

### Example

In your MDC content:

```markdown
The system uses <ref text="A distributed cache that stores key-value pairs">Redis</ref> for caching.
```

This will render as:
- The word "Redis" with a dotted underline
- On hover, shows the tooltip: "A distributed cache that stores key-value pairs"

### Styling

The `<ref>` tag has default styling:
- Display: inline
- Cursor: help
- Text decoration: underline with dotted style

You can customize the styling by modifying the `ProseRef.vue` component's styles.

### Configuration

The component is configured in `nuxt.config.ts`:

```typescript
mdc: {
    components: {
        prose: true,
        map: {
            ref: "ProseRef",
        },
    },
},
```

The prose components directory is globally registered:

```typescript
components: [
    {
        path: "~/components/prose",
        global: true,
        pathPrefix: false,
    },
],
```

