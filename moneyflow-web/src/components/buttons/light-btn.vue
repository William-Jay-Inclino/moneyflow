<template>
    <button
        class="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-blue-600 font-semibold shadow-sm transition whitespace-nowrap text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 active:bg-gray-300 disabled:bg-gray-50 disabled:text-blue-300 cursor-pointer disabled:cursor-not-allowed"
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