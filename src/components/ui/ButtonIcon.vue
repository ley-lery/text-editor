<template>
    <button 
        :class="[
            'cursor-pointer p-2 min-h-8 min-w-8 max-h-8 max-w-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-100/10 transition-colors duration-300 flex items-center justify-center select-none', 
            radius, size,
            isActive ? 'bg-zinc-300 dark:bg-zinc-100/10 text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400',
            isDisabled && 'opacity-50 pointer-events-none select-none',
        ]"
        @click="onClick"
    >
        <slot />
    </button>
</template>
<script setup lang="ts">
import { defineProps, computed } from 'vue';

const props = defineProps<{
    isActive?: boolean
    isDisabled?: boolean
    onClick?: () => void
    radius?: 'none' | 'sm' | 'md' | 'lg' | 'full'
    size?: 'sm' | 'md' | 'lg'
}>()

const radiusMaps = {
    'none': 'rounded-none',
    'sm': 'rounded-sm',
    'md': 'rounded-md',
    'lg': 'rounded-lg',
    'full': 'rounded-full'
}

const sizeMaps = {
    'sm': 'min-h-6 min-w-6 max-h-6 max-w-6',
    'md': 'min-h-8 min-w-8 max-h-8 max-w-8',
    'lg': 'min-h-10 min-w-10 max-h-10 max-w-10'
}

const radius = computed(() => radiusMaps[props.radius ?? 'full'])
const size = computed(() => sizeMaps[props.size ?? 'md'])

</script>