export function useEditorCommands(editor: any, updateContent: () => void) {
    const exec = (command: string, value?: string) => {
      document.execCommand(command, false, value)
      updateContent()
    }
    return { exec }
}
  