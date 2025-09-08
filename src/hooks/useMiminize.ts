import { ref } from "vue"

const minimize = ref(false)

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
