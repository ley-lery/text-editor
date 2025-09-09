<template>
    <div class="flex justify-center mt-6 mb-6 relative z-20">
        <!-- A4 Paper Container -->
        <div class="snol-a4-paper bg-white relative overflow-hidden">
            <!-- Paper content -->
            <div class="snol-paper-content p-12">
                <!-- Header with document title -->
                <div class="mb-8 text-center">
                    <span class="text-xs text-gray-400 uppercase tracking-widest">{{ editorTitle }}</span>
                </div>
                
                <!-- Main content -->
                <div class="snol-document-content">
                    <div
                        v-html="editorStore.modelValue || '<p class=&quot;text-gray-400 italic&quot;></p>'"
                        :class="[
                            'prose prose-lg max-w-none',
                            editorStore.fontFamily ? `font-${editorStore.fontFamily}` : '',
                            editorStore.fontWeight ? `font-${editorStore.fontWeight}` : '',
                            editorStore.fontStyle,
                            editorStore.textDecoration,
                            editorStore.textAlign ? `text-${editorStore.textAlign}` : '',
                            editorStore.capitalize,
                        ]"
                        :style="{
                            color: editorStore.textColor || undefined,
                            lineHeight: editorStore.lineHeight ? editorStore.lineHeight : undefined,
                            fontSize: `${editorStore.fontSize}px`,
                        }"
                        contenteditable="false"
                        readonly
                        tabindex="-1"
                        style="user-select: none; pointer-events: none;"
                    ></div>
                </div>
            </div>
            
            <!-- Paper edges effect -->
            <div class="snol-paper-edges"></div>
        </div>
    </div>
</template>
<script lang="ts" setup>    
import {useEditorStoreFactory} from '../../stores/index'
const props = defineProps({
    editorId: {
        type: String,
        required: true
    },
    editorTitle: {
        type: String,
        required: false,
        default: "Document Preview"
    }
})
const editorStore = useEditorStoreFactory(props.editorId)
</script>

<style scoped>
/* A4 Paper Dimensions */
.snol-a4-paper {
    width: 210mm;
    min-height: 297mm;
    /* Scale down for screen viewing while maintaining ratio */
    transform: scale(0.7);
    transform-origin: top center;
    margin: 0 auto;
    border-radius: 2px;
    position: relative;
}

/* Paper content area with proper margins */
.snol-paper-content {
    min-height: calc(297mm - 6rem);
    padding: 3rem 2.5rem;
}

/* Document content styling */
.snol-document-content {
    line-height: 1.6;
    color: #1f2937;
    word-wrap: break-word;
    hyphens: auto;
}

/* Ensure preview content is completely read-only */
.snol-document-content > div {
    user-select: none !important;
    pointer-events: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    cursor: default !important;
}

.snol-document-content :deep(*) {
    user-select: none !important;
    pointer-events: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    cursor: default !important;
    outline: none !important;
    resize: none !important;
    -webkit-touch-callout: none !important;
    -webkit-tap-highlight-color: transparent !important;
}

/* Specific table cell read-only enforcement */
.snol-document-content :deep(table),
.snol-document-content :deep(th),
.snol-document-content :deep(td) {
    user-select: none !important;
    pointer-events: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    cursor: default !important;
    outline: none !important;
    -webkit-user-modify: read-only !important;
    -moz-user-modify: read-only !important;
}

/* Prevent contenteditable behavior */
.snol-document-content :deep([contenteditable]),
.snol-document-content :deep([contenteditable="true"]) {
    -webkit-user-modify: read-only !important;
    pointer-events: none !important;
}

/* Disable any form elements */
.snol-document-content :deep(input),
.snol-document-content :deep(textarea),
.snol-document-content :deep(select),
.snol-document-content :deep(button) {
    pointer-events: none !important;
    user-select: none !important;
    cursor: default !important;
    opacity: 1 !important;
}

/* Paper edges effect for realism */
.snol-paper-edges::before {
    content: '';
    position: absolute;
    top: 0;
    left: -1px;
    right: -1px;
    bottom: 0;
    background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(0, 0, 0, 0.02) 1%,
        rgba(0, 0, 0, 0.02) 99%,
        transparent 100%
    );
    pointer-events: none;
}

/* Responsive scaling for smaller screens */
@media (max-width: 1024px) {
    .snol-a4-paper {
        transform: scale(0.6);
    }
}

@media (max-width: 768px) {
    .snol-a4-paper {
        transform: scale(0.5);
        width: 90vw;
        min-height: auto;
    }
    
    .snol-paper-content {
        padding: 2rem 1.5rem;
        min-height: auto;
    }
}

@media (max-width: 480px) {
    .snol-a4-paper {
        transform: scale(0.4);
    }
}

/* Print styles for actual A4 printing */
@media print {
    .snol-a4-paper {
        transform: none !important;
        box-shadow: none !important;
        margin: 0 !important;
        width: 210mm !important;
        min-height: 297mm !important;
    }
    
    .snol-paper-content {
        padding: 20mm !important;
    }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .snol-a4-paper {
        background: #ffffff;
    }
}

/* Enhanced typography for better readability */
.snol-document-content :deep(h1),
.snol-document-content :deep(h2),
.snol-document-content :deep(h3),
.snol-document-content :deep(h4),
.snol-document-content :deep(h5),
.snol-document-content :deep(h6) {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
    line-height: 1.3;
}

.snol-document-content :deep(p) {
    margin-bottom: 1em;
    text-align: justify;
    text-justify: inter-word;
}

.snol-document-content :deep(ul),
.snol-document-content :deep(ol) {
    margin: 1em 0;
    padding-left: 2em;
}

.snol-document-content :deep(blockquote) {
    margin: 1.5em 0;
    padding-left: 1.5em;
    border-left: 4px solid #e5e7eb;
    font-style: italic;
    color: #6b7280;
}

.snol-document-content :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5em 0;
    table-layout: fixed;
    word-wrap: break-word;
    user-select: none !important;
    pointer-events: none !important;
    cursor: default !important;
}

.snol-document-content :deep(th),
.snol-document-content :deep(td) {
    padding: 0.5em;
    border: 1px solid #e5e7eb;
    text-align: left;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    min-width: 0;
    max-width: 100%;
    user-select: none !important;
    pointer-events: none !important;
    cursor: default !important;
    outline: none !important;
    -webkit-user-modify: read-only !important;
    -moz-user-modify: read-only !important;
}

.snol-document-content :deep(th) {
    background-color: #f9fafb;
    font-weight: 600;
}

.snol-document-content :deep(code) {
    background-color: #f3f4f6;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9em;
}

.snol-document-content :deep(pre) {
    background-color: #f3f4f6;
    padding: 1em;
    border-radius: 6px;
    overflow-x: auto;
    margin: 1em 0;
}

.snol-document-content :deep(pre code) {
    background: none;
    padding: 0;
}
</style>