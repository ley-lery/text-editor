<template>
    <AnimatePresence :initial="false">
      <motion.div
        v-if="isOpen"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        class="fixed inset-0 bg-black/10 dark:bg-black/80 flex items-center justify-center z-10 w-full h-full"
        @click="onClose"
        :style="{ pointerEvents: hideOverlay ? 'none' : 'auto' }"
      />
      
        <div class="mb-4 absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 z-20">
          <motion.div
            v-if="isOpen"
            :initial="{ opacity: 0, height: 0 }"
            :animate="{ opacity: 1, height: layouts.height || 310 }"
            :exit="{ opacity: 0, height: 0 }"
            :transition="{ delay: 0.2, type: 'spring', damping: 15, stiffness: 100 }"
            class="overflow-hidden shadow-sm shadow-zinc-200/50 dark:shadow-zinc-900/50 
              border border-white dark:border-zinc-800 bg-white/50 dark:bg-zinc-300/10 
              rounded-3xl flex items-center justify-center px-4 w-fit"
            :class="blur"
          >
            <div v-if="isGradient" :style="gradientStyle" class="w-full h-full absolute top-0 left-0 opacity-30 dark:opacity-0 pointer-events-none"/>
            <div :class="class">
                <slot />
            </div>
          </motion.div>
        </div>
    </AnimatePresence>
</template>
<script setup lang="ts">
    import { motion, AnimatePresence } from 'motion-v'
    import { computed } from 'vue'

    type BlurSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"

    const props = defineProps<{
        isOpen: boolean,
        onClose: () => void,
        hideOverlay?: boolean,
        layouts: {
            height: number,
        }
        class?: string,
        isGradient?: boolean,
        blurSize?: BlurSize,
    }>()

    const blurSizeMaps: Record<BlurSize, string> = {
        sm: 'backdrop-blur-sm',
        md: 'backdrop-blur-md',
        lg: 'backdrop-blur-lg',
        xl: 'backdrop-blur-xl',
        '2xl': 'backdrop-blur-2xl',
        '3xl': 'backdrop-blur-3xl',
    }

    const blur = computed(() => blurSizeMaps[props.blurSize ?? 'md'])

    const gradientStyle: any = {
        background: `
            radial-gradient(ellipse 80% 60% at 5% 40%, rgba(175, 109, 255, 0.48), transparent 67%),
            radial-gradient(ellipse 70% 60% at 45% 45%, rgba(255, 100, 180, 0.41), transparent 67%),
            radial-gradient(ellipse 62% 52% at 83% 76%, rgba(255, 235, 170, 0.44), transparent 63%),
            radial-gradient(ellipse 60% 48% at 75% 20%, rgba(120, 190, 255, 0.36), transparent 66%),
            linear-gradient(45deg, #f7eaff 0%, #fde2ea 100%)`,
        pointerEvents: "none"
    }
</script>
