<template>
    <div class="relative">
      <!-- Trigger -->
      <div
        class="w-6 h-6 rounded-full border border-neutral-700 cursor-pointer"
        :style="{ backgroundColor: color }"
        @click="isOpen = !isOpen"
      />
      <!-- Overlay and Popup -->
      <AnimatePresence :initial="false">
        <div
          v-if="isOpen"
          @click="isOpen = false"
          class="absolute inset-0 z-0 w-full h-full bg-black/30"
        />
        <motion.div
          v-if="isOpen"
          :initial="{ opacity: 0, scale: 0.95 }"
          :animate="{ opacity: 1, scale: 1 }"
          :exit="{ opacity: 0, scale: 0.95 }"
          :transition="{ duration: 0.2 }"
          class="absolute z-10"
        >
          <div @click.stop>
            <Colors v-model="color" />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, defineProps } from 'vue';
  import { AnimatePresence, motion } from 'motion-v';
  import Colors from './Colors.vue';
  
  // For v-model support
  const props = defineProps<{
    modelValue: string,
    changeColor?: (color: string) => void
  }>();
  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'update:color', value: string): void
  }>();
  
  const color = ref(props.modelValue);
  const isOpen = ref(false);
  
  // Sync local color with parent prop
  watch(() => props.modelValue, (val) => {
    if (val !== color.value) color.value = val;
  });
  
  // When color changes, emit to parent and optionally call changeColor callback
  watch(color, (val) => {
    emit('update:modelValue', val);
    emit('update:color', val); // only if you want both events
    if (props.changeColor) props.changeColor(val);
  });
  </script>