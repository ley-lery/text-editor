// stores/editor.ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'



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
    const lineHeight = ref<LineHeight>('normal')
    const bulletList = ref<BulletList>('default')
    const numberList = ref<NumberList>('default')
    const link = ref('')
    const modelValue = ref('')
    const capitalize = ref<Capitalizes>('none')
    const keyword = ref<string>('')

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
    const setLineHeight = (height: LineHeight) => (lineHeight.value = height)
    const setBulletList = (bullet: BulletList) => (bulletList.value = bullet)
    const setNumberList = (number: NumberList) => (numberList.value = number)
    const setLink = (url: string) => (link.value = url)
    const setCapitalize = (val: Capitalizes) => (capitalize.value = val)
    const setBackgroundTextColor = (color: string) => (backgroundTextColor.value = color)
    const setKeyword = (key: string) => (keyword.value = key)

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

    // --- Store Configuration ---
    const storeProperties: Record<string, StoreProperty> = {
      fontSize: {
        label: 'Font Size',
        value: fontSize,
        type: 'number',
        min: 8,
        max: 72,
        step: 1,
        unit: 'px'
      },
      textColor: { 
        label: 'Text Color', 
        value: textColor, 
        type: 'color' 
      },
      backgroundColor: { 
        label: 'Background Color', 
        value: backgroundColor, 
        type: 'color' 
      },
      backgroundTextColor: { 
        label: 'Background Text Color', 
        value: backgroundTextColor, 
        type: 'color' 
      },
      fontFamily: { 
        label: 'Font Family', 
        value: fontFamily, 
        type: 'select',
        options: ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'] as const
      },
      fontWeight: { 
        label: 'Font Weight', 
        value: fontWeight, 
        type: 'select',
        options: ['normal', 'bold', 'lighter', 'bolder'] as const
      },
      fontStyle: { 
        label: 'Font Style', 
        value: fontStyle, 
        type: 'select',
        options: ['normal', 'italic', 'oblique'] as const
      },
      textDecoration: { 
        label: 'Text Decoration', 
        value: textDecoration, 
        type: 'select',
        options: ['none', 'underline', 'overline', 'line-through'] as const
      },
      textAlign: { 
        label: 'Text Align', 
        value: textAlign, 
        type: 'select',
        options: ['left', 'center', 'right', 'justify'] as const
      },
      lineHeight: { 
        label: 'Line Height', 
        value: lineHeight, 
        type: 'select',
        options: ['normal', 'tight', 'snug', 'relaxed', 'loose'] as const
      },
      bulletList: { 
        label: 'Bullet List', 
        value: bulletList, 
        type: 'select',
        options: ['default', 'disc', 'circle', 'square', 'none'] as const
      },
      numberList: { 
        label: 'Number List', 
        value: numberList, 
        type: 'select',
        options: ['default', 'decimal', 'decimal-leading-zero', 'lower-roman', 'upper-roman'] as const
      },
      link: { 
        label: 'Link', 
        value: link, 
        type: 'text' 
      },
      capitalize: { 
        label: 'Text Transform', 
        value: capitalize, 
        type: 'select',
        options: ['none', 'capitalize', 'uppercase', 'lowercase'] as const
      },
    }

    // --- Utility Actions ---
    const resetToDefaults = () => {
      fontSize.value = 15
      textColor.value = '#000000'
      backgroundColor.value = '#ffffff'
      backgroundTextColor.value = '#000000'
      fontWeight.value = 'normal'
      fontFamily.value = 'Arial'
      fontStyle.value = 'normal'
      textDecoration.value = 'none'
      textAlign.value = 'left'
      lineHeight.value = 'normal'
      bulletList.value = 'default'
      numberList.value = 'default'
      link.value = ''
      capitalize.value = 'none'
    }

    const exportState = () => {
      return {
        editorId,
        fontSize: fontSize.value,
        textColor: textColor.value,
        backgroundColor: backgroundColor.value,
        backgroundTextColor: backgroundTextColor.value,
        fontWeight: fontWeight.value,
        fontFamily: fontFamily.value,
        fontStyle: fontStyle.value,
        textDecoration: textDecoration.value,
        textAlign: textAlign.value,
        lineHeight: lineHeight.value,
        bulletList: bulletList.value,
        numberList: numberList.value,
        link: link.value,
        capitalize: capitalize.value,
        content: modelValue.value,
      }
    }

    const importState = (state: Partial<ReturnType<typeof exportState>>) => {
      if (state.fontSize !== undefined) setFontSize(state.fontSize)
      if (state.textColor !== undefined) setTextColor(state.textColor)
      if (state.backgroundColor !== undefined) setBackgroundColor(state.backgroundColor)
      if (state.backgroundTextColor !== undefined) setBackgroundTextColor(state.backgroundTextColor)
      if (state.fontWeight !== undefined) fontWeight.value = state.fontWeight
      if (state.fontFamily !== undefined) fontFamily.value = state.fontFamily
      if (state.fontStyle !== undefined) fontStyle.value = state.fontStyle
      if (state.textDecoration !== undefined) textDecoration.value = state.textDecoration
      if (state.textAlign !== undefined) textAlign.value = state.textAlign
      if (state.lineHeight !== undefined) lineHeight.value = state.lineHeight
      if (state.bulletList !== undefined) bulletList.value = state.bulletList
      if (state.numberList !== undefined) numberList.value = state.numberList
      if (state.link !== undefined) setLink(state.link)
      if (state.capitalize !== undefined) capitalize.value = state.capitalize
      if (state.content !== undefined) updateModelValue(state.content)
    }

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
      lineHeight,
      bulletList,
      numberList,
      link,
      modelValue,
      capitalize,
      keyword,
      backgroundTextColor,

      // history
      history,
      historyIndex,

      // configuration
      storeProperties,
      
      // actions
      setFontSize,
      setTextColor,
      setBackgroundColor,
      setFontWeight,
      setFontFamily,
      setFontStyle,
      setTextDecoration,
      setTextAlign,
      setLineHeight,
      setBulletList,
      setNumberList,
      setLink,
      setCapitalize,
      setKeyword,
      updateModelValue,
      setBackgroundTextColor,
      undo,
      redo,
      resetToDefaults,
      exportState,
      importState,
    }
  })()
}
