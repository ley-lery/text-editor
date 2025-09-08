<template>
    <div class="relative min-w-52">
      <!-- Button -->
      <button
        ref="trigger"
        @click="toggleOpen"
        class="w-full flex items-center justify-between min-h-8 max-h-8 px-3 rounded-xl cursor-pointer bg-zinc-200 dark:bg-zinc-700/50"
      >
        <span class="text-base text-zinc-500 dark:text-zinc-400">
          {{ selectedOption?.label || placeholder }}
        </span>
        <motion.span
           :animate="{ rotate: isOpen ? 180 : 0 }"
        >
            <ChevronDown :size="16" class="text-zinc-500 dark:text-zinc-400"/>
        </motion.span>
      </button>

      <!-- Overlay -->
      <div
          @click="isOpen = false"
          v-if="isOpen"
          class="fixed inset-0 z-0 opacity-35 w-full h-full bg-transparent"
      />
  
      <!-- Dropdown -->
      <div
        v-show="isOpen"
        ref="dropdown"
        class="absolute left-0 mt-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-2xl shadow-lg overflow-hidden z-20 p-2"
      >
        <ul>
          <li
            v-for="option in options"
            :key="option.value"
            @click="selectOption(option)"
            class="px-2 py-1 rounded-xl cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-zinc-100/10 text-zinc-500 dark:text-zinc-400 text-base transition"
          >
            {{ option.label }}
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watch, nextTick } from "vue";
  import { animate, motion } from "motion-v";
  import { ChevronDown } from 'lucide-vue-next';

  
  interface Option {
    label: string;
    value: string | number;
  }
  
  const props = defineProps<{
    options: Option[];
    modelValue?: string | number | null;
    placeholder?: string;
  }>();
  
  const emit = defineEmits<{
    (e: "update:modelValue", value: string | number): void;
  }>();
  
  const isOpen = ref(false);
  const selectedOption = ref<Option | null>(null);
  const dropdown = ref<HTMLDivElement | null>(null);
  
  const toggleOpen = () => {
    isOpen.value = !isOpen.value;
  };
  
  const selectOption = (option: Option) => {
    selectedOption.value = option;
    emit("update:modelValue", option.value);
    isOpen.value = false;
  };
  
  // Animate dropdown when opened
  watch(isOpen, async (open) => {
    if (dropdown.value) {
      if (open) {
        await nextTick(); // wait until element is rendered
        animate(dropdown.value, { opacity: [0, 1], y: [-10, 0] }, { duration: 0.25 });
      } else {
        animate(dropdown.value, { opacity: [1, 0], y: [0, -10] }, { duration: 0.2 });
      }
    }
  });
  
  // Set default option if modelValue exists
  watch(
    () => props.modelValue,
    (val) => {
      selectedOption.value = props.options.find((o) => o.value === val) || null;
    },
    { immediate: true }
  );
  </script>
  