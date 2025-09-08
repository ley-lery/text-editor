<template>
    <nav class="flex items-center justify-between px-4 pt-2 select-none bg-zinc-3000">
      <div class="flex space-x-2">
        <Popover :options="fileMenu" >
            <template #default>
                <button class="px-2 py-1 rounded cursor-pointer text-zinc-600 dark:text-zinc-300 dark:hover:text-zinc-200 font-medium text-xs focus:outline-none">
                    File
                </button>
            </template>
        </Popover>
        <Popover :options="editMenu" >
            <template #default>
                <button class="px-2 py-1 rounded cursor-pointer text-zinc-600 dark:text-zinc-300 dark:hover:text-zinc-200 font-medium text-xs focus:outline-none">
                    Edit
                </button>
            </template>
        </Popover>
      </div>
    </nav>
</template>
<script setup lang="ts">
import Popover from '../ui/Popover.vue';

    const fileMenu = [
        { 
            label: 'New', 
            icon: 'Plus',
            onClick: () => console.log('New')
        },
        { 
            label: 'Open...', 
            icon: 'FolderOpen',
            onClick: () => console.log('Open')
        },
        { 
            label: 'Save', 
            icon: 'Save',
            onClick: () => console.log('Save')
        },
        { 
            label: 'Save As...', 
            icon: 'SaveAs',
            onClick: () => console.log('Save As')
        },
        { 
            label: 'Close', 
            icon: 'Close',
            onClick: () => console.log('Close')
        },
        { type: 'divider' },
        { 
            label: 'Exit', 
            icon: 'X',
            onClick: () => console.log('Exit')
        },
    ]
    const editMenu = [
        { 
            label: 'Undo', 
            icon: 'Undo',
            onClick: () => console.log('Undo')
        },
        { 
            label: 'Redo', 
            icon: 'Redo',
            onClick: () => console.log('Redo')
        },
        { type: 'divider' },
        { 
            label: 'Cut', 
            icon: 'Cut',
            onClick: () => console.log('Cut')
        },
        { 
            label: 'Copy', 
            icon: 'Copy',
            onClick: () => console.log('Copy')
        },
        { 
            label: 'Paste', 
            icon: 'Paste',
            onClick: () => console.log('Paste')
        },
        { type: 'divider' },
        { 
            label: 'Select All', 
            icon: 'SelectAll',
            onClick: () => console.log('Select All')
        },

    ]
</script>