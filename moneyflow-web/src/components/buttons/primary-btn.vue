<template>
    <button
        class="px-2 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white font-semibold shadow-sm transition whitespace-nowrap text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 active:bg-blue-700 disabled:bg-blue-200 disabled:text-blue-400 disabled:cursor-not-allowed"
        :disabled="disabled"
        type="button"
    >
        <span class="flex items-center whitespace-nowrap">
            <slot />
        </span>
    </button>
</template>

<script setup lang="ts">
defineProps<{
    disabled?: boolean
}>()
</script>