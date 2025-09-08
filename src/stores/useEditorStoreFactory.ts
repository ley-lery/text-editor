// stores/editor.ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

// Types

export function useEditorStoreFactory(editorId: string) {
  return defineStore(`editor-${editorId}`, () => {
    // --- State ---
    const fontSize = ref(15)
    const textColor = ref('')
    const backgroundColor = ref('#000')
    const backgroundTextColor = ref('') 
    const fontWeight = ref<FontWeight>('normal')
    const fontFamily = ref<FontFamily>('Arial')
    const fontStyle = ref<FontStyle>('normal')
    const textDecoration = ref<TextDecoration>('none')
    const textAlign = ref<TextAlign>('left')
    const bulletList = ref<BulletList>('default')
    const numberList = ref<NumberList>('default')
    const link = ref('')
    const modelValue = ref('')
    const capitalize = ref<Capitalize>('none')

    // --- History ---
    const history = ref<string[]>([''])
    const historyIndex = ref(0)

    // --- Actions (setters) ---
    const setFontSize = (size: number) => (fontSize.value = size)
    const setTextColor = (color: string) => (textColor.value = color)
    const setBackgroundColor = (color: string) => (backgroundColor.value = color)
    const setFontWeight = (weight: FontWeight) => (fontWeight.value = weight)
    const setFontFamily = (family: FontFamily) => (fontFamily.value = family)
    const setFontStyle = (style: FontStyle) => (fontStyle.value = style)
    const setTextDecoration = (decoration: TextDecoration) => (textDecoration.value = decoration)
    const setTextAlign = (align: TextAlign) => (textAlign.value = align)
    const setBulletList = (bullet: BulletList) => (bulletList.value = bullet)
    const setNumberList = (number: NumberList) => (numberList.value = number)
    const setLink = (url: string) => (link.value = url)
    const setCapitalize = (val: Capitalize) => (capitalize.value = val)
    const setBackgroundTextColor = (color: string) => (backgroundTextColor.value = color)

    // --- History Management ---
    const updateModelValue = (val: string) => {
      modelValue.value = val
      if (val !== history.value[historyIndex.value]) {
        // trim future history
        history.value = history.value.slice(0, historyIndex.value + 1)
        history.value.push(val)
        historyIndex.value = history.value.length - 1

        // keep history length max 50
        if (history.value.length > 50) {
          history.value = history.value.slice(-50)
          historyIndex.value = history.value.length - 1
        }
      }
    }

    const undo = () => {
      if (historyIndex.value > 0) {
        historyIndex.value--
        modelValue.value = history.value[historyIndex.value]
      }
    }

    const redo = () => {
      if (historyIndex.value < history.value.length - 1) {
        historyIndex.value++
        modelValue.value = history.value[historyIndex.value]
      }
    }

    // --- Watchers ---
    watch(modelValue, (newVal) => {
      if (newVal !== history.value[historyIndex.value]) {
        updateModelValue(newVal)
      }
    })

    // --- Return public API ---
    return {
      // id
      editorId,

      // state
      fontSize,
      textColor,
      backgroundColor,
      fontWeight,
      fontFamily,
      fontStyle,
      textDecoration,
      textAlign,
      bulletList,
      numberList,
      link,
      modelValue,
      capitalize,

      // history
      history,
      historyIndex,

      // actions
      setFontSize,
      setTextColor,
      setBackgroundColor,
      setFontWeight,
      setFontFamily,
      setFontStyle,
      setTextDecoration,
      setTextAlign,
      setBulletList,
      setNumberList,
      setLink,
      setCapitalize,
      updateModelValue,
      setBackgroundTextColor,
      undo,
      redo,
    }
  })()
}
