<template>
  <div class="flex items-center justify-center">
    <div 
      class="absolute inset-0 z-0 opacity-35" 
      style="
        background: radial-gradient(ellipse 80% 60% at 5% 40%, rgba(175, 109, 255, 0.48), transparent 67%),
        radial-gradient(ellipse 70% 60% at 45% 45%, rgba(255, 100, 180, 0.41), transparent 67%),
        radial-gradient(ellipse 62% 52% at 83% 76%, rgba(255, 235, 170, 0.44), transparent 63%),
        radial-gradient(ellipse 60% 48% at 75% 20%, rgba(120, 190, 255, 0.36), transparent 66%),
        linear-gradient(45deg, #f7eaff 0%, #fde2ea 100%);
      "
    >
    </div>
    <div 
      class="  bg-white/50 backdrop-blur-sm  relative z-10 overflow-hidden dark:bg-zinc-800/50"
      :class="minimize ? 'h-auto rounded-[40px] min-w-7xl max-w-full' : 'h-screen min-w-screen'"
    >
      <!-- <FileMenuBar/> -->
      <div class="p-4 pt-4 flex flex-col gap-2 h-full">
        <Toolbar :editorId="editorId"/>
        <div class="h-full">
          <EditorContent 
            :modelValue="modelValue"
            @update:modelValue="updateModelValue"
            placeholder="Type something..."
            :editorId="editorId"
            :isTableModalOpen="isOpen"
            :closeTableModal="onClose"
            :openTableModal="onOpen"
          />
        </div>
      </div>
      
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed, provide, watch } from 'vue';
  import EditorContent from './TextEditorContent.vue';
  import Toolbar from './Toolbar.vue';
  import { useEditorStoreFactory } from '../../stores/index';
  import { useDisclosure } from '../../hooks/useDisclosure';
  import { useMiminize } from '../../hooks/useMiminize';

  const props = defineProps<{ editorId: string }>()
  const editor = useEditorStoreFactory(props.editorId)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { minimize } = useMiminize()

  watch(minimize, () => {
    console.log(minimize.value)
  })
  
  const modelValue = computed({
      get: () => editor.modelValue,
      set: (val: string) => editor.updateModelValue(val)
  });

  const updateModelValue = (val: string) => {
      editor.updateModelValue(val);
  };

  provide('editor', editor)
</script>
