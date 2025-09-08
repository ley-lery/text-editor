<template>
    <div class="mx-auto mt-10 bg-white rounded-xl shadow-md p-8 grid grid-cols-8 gap-4">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Detail</h1>
        <div class="w-full flex flex-col items-center">
            <span class="text-sm text-gray-500 uppercase tracking-wide">Font Family</span>
            <p class="text-lg text-gray-700 font-mono bg-gray-100 rounded px-3 py-1 mt-1">
                {{ editorStore.fontFamily }}
            </p>
        </div>
        <div class="w-full flex flex-col items-center">
            <span class="text-sm text-gray-500 uppercase tracking-wide">Font Size</span>
            <p class="text-lg text-gray-700 font-mono bg-gray-100 rounded px-3 py-1 mt-1">
                {{ editorStore.fontSize }}
            </p>
        </div>
        <div class="w-full flex flex-col items-center">
            <span class="text-sm text-gray-500 uppercase tracking-wide">Text Color</span>
            <p class="text-lg text-gray-700 font-mono bg-gray-100 rounded px-3 py-1 mt-1">
                {{ editorStore.textColor || 'default' }}
            </p>
        </div>
        <div class="w-full flex flex-col items-center">
            <span class="text-sm text-gray-500 uppercase tracking-wide">Background Color</span>
            <p class="text-lg text-gray-700 font-mono bg-gray-100 rounded px-3 py-1 mt-1">
                {{ editorStore.backgroundColor }}
            </p>
        </div>
        <div class="w-full flex flex-col items-center">
            <span class="text-sm text-gray-500 uppercase tracking-wide">Background Text Color</span>
            <p class="text-lg text-gray-700 font-mono bg-gray-100 rounded px-3 py-1 mt-1">
                {{ editorStore.backgroundTextColor || 'default' }}
            </p>
        </div>
        <div class="w-full flex flex-col items-center">
            <span class="text-sm text-gray-500 uppercase tracking-wide">Font Weight</span>
            <p class="text-lg text-gray-700 font-mono bg-gray-100 rounded px-3 py-1 mt-1">
                {{ editorStore.fontWeight }}
            </p>
        </div>
        <div class="w-full flex flex-col items-center">
            <span class="text-sm text-gray-500 uppercase tracking-wide">Font Style</span>
            <p class="text-lg text-gray-700 font-mono bg-gray-100 rounded px-3 py-1 mt-1">
                {{ editorStore.fontStyle }}
            </p>
        </div>
        <div class="w-full flex flex-col items-center">
            <span class="text-sm text-gray-500 uppercase tracking-wide">Text Decoration</span>
            <p class="text-lg text-gray-700 font-mono bg-gray-100 rounded px-3 py-1 mt-1">
                {{ editorStore.textDecoration }}
            </p>
        </div>
        <div class="w-full flex flex-col items-center">
            <span class="text-sm text-gray-500 uppercase tracking-wide">Text Align</span>
            <p class="text-lg text-gray-700 font-mono bg-gray-100 rounded px-3 py-1 mt-1">
                {{ editorStore.textAlign }}
            </p>
        </div>
        <div class="w-full flex flex-col items-center">
            <span class="text-sm text-gray-500 uppercase tracking-wide">Bullet List</span>
            <p class="text-lg text-gray-700 font-mono bg-gray-100 rounded px-3 py-1 mt-1">
                {{ editorStore.bulletList }}
            </p>
        </div>
        <div class="w-full flex flex-col items-center">
            <span class="text-sm text-gray-500 uppercase tracking-wide">Number List</span>
            <p class="text-lg text-gray-700 font-mono bg-gray-100 rounded px-3 py-1 mt-1">
                {{ editorStore.numberList }}
            </p>
        </div>
        <div class="w-full flex flex-col items-center">
            <span class="text-sm text-gray-500 uppercase tracking-wide">Link</span>
            <p class="text-lg text-gray-700 font-mono bg-gray-100 rounded px-3 py-1 mt-1">
                {{ editorStore.link || 'none' }}
            </p>
        </div>
        <div class="w-full flex flex-col items-center">
            <span class="text-sm text-gray-500 uppercase tracking-wide">Model Value</span>
            <p class="text-lg text-gray-700 font-mono bg-gray-100 rounded px-3 py-1 mt-1">
                {{ editorStore.modelValue || 'empty' }}
            </p>
        </div>
        <div class="w-full flex flex-col items-center">
            <span class="text-sm text-gray-500 uppercase tracking-wide">Capitalize</span>
            <p class="text-lg text-gray-700 font-mono bg-gray-100 rounded px-3 py-1 mt-1">
                {{ editorStore.capitalize }}
            </p>
        </div>
        <div class="w-full flex flex-col items-center">
            <span class="text-sm text-gray-500 uppercase tracking-wide">Keyword</span>
            <p class="text-lg text-gray-700 font-mono bg-gray-100 rounded px-3 py-1 mt-1">
                {{ filtered(editorStore.keyword) }}
            </p>
        </div>
    </div>
</template>
<script lang="ts" setup>
import {useEditorStoreFactory} from '../../stores/index'
const editorStore = useEditorStoreFactory('editor-1')

const filtered = (keyword: string) => {
    switch(keyword){
        case 'company':
            return "IT Khmer"
        case 'product':
            return "Coca Cola"
        case 'service':
            return "Delivery"
        case 'technology':
            return "AI"
        case 'business':
            return "IT Khmer"
        default:
            return ''
    }
}
</script>