<template>
  <div class="flex items-center gap-2">
    <ButtonIcon @click="toggleTheme" :isActive="isDark">
      <Sun v-if="isDark" class="size-4" />
      <Moon v-else class="size-4" />
    </ButtonIcon>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Sun, Moon } from 'lucide-vue-next';
import ButtonIcon from '../ui/ButtonIcon.vue';

const isDark = ref(false);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  updateTheme();
};

const updateTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  isDark.value = savedTheme === 'dark' || (!savedTheme && prefersDark);
  updateTheme();
});
</script>
