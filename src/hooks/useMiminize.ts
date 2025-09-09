import { ref } from "vue"

const minimize = ref<boolean>(true)

const useMiminize = () => {
    const toggleMinimize = () => {
        minimize.value = !minimize.value
    }

    return {
        minimize,
        toggleMinimize
    }
}

export { useMiminize }
