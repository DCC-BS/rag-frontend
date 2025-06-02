import { v4 as uuidv4 } from "uuid";
import { ref } from "vue";

export function useThread() {
    const thread_id = ref<string>(uuidv4());

    function resetThreadId(): void {
        thread_id.value = uuidv4();
    }

    return {
        thread_id,
        resetThreadId,
    };
}
