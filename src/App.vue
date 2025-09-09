<template>
  <div class="grid grid-cols-1 place-items-center p-10 bg-zinc-200 dark:bg-zinc-800 h-screen overflow-auto">
    <Preview editorId="editor-1" editorTitle="Editor 1 Preview" />
    <TextEditor editorId="editor-1"/>

    <div class="border-zinc-300 border w-full mt-20"></div>

    <Preview editorId="editor-2" editorTitle="Editor 2 Preview" />
    <TextEditor editorId="editor-2"/>
     <!-- Background gradient -->
    <div class="absolute inset-0 z-0 opacity-5 pointer-events-none" :style="gradientStyle" style="background-attachment: fixed;" />
  </div>  
</template>
  
<script setup lang="ts">
  import { onMounted } from 'vue';
  import TextEditor from './components/layouts/TextEditor.vue';
  import { useEditorStoreFactory } from './stores/index'
  import Preview from './components/layouts/Preview.vue';

  const editorStore = useEditorStoreFactory('editor-1')
  onMounted(() => {
    const properties = editorStore.storeProperties
    console.log(properties, "properties")
  })
  const gradientStyle: any = {
    background: `
      radial-gradient(ellipse 80% 60% at 5% 40%, rgba(175, 109, 255, 0.48), transparent 67%),
      radial-gradient(ellipse 70% 60% at 45% 45%, rgba(255, 100, 180, 0.41), transparent 67%),
      radial-gradient(ellipse 62% 52% at 83% 76%, rgba(255, 235, 170, 0.44), transparent 63%),
      radial-gradient(ellipse 60% 48% at 75% 20%, rgba(120, 190, 255, 0.36), transparent 66%),
      linear-gradient(45deg, #f7eaff 0%, #fde2ea 100%)
    `,
    pointerEvents: "none",
  }
</script>