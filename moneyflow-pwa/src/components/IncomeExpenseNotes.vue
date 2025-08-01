<template>
    <span 
        class="expense-notes fw-semibold text-truncate" 
        @mouseenter="show = true" 
        @mouseleave="show = false" 
        ref="spanRef"
    >
        {{ item.notes || 'No notes' }}

        <div 
            v-if="show" 
            class="custom-tooltip" 
            :style="tooltipStyle"
            role="tooltip"
        >
            {{ item.notes || 'No notes' }}
        </div>
    </span>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from 'vue';

const props = defineProps({
    item: {
        type: Object,
        required: true,
        // expects item.notes string property
    }
});

const show = ref(false);
const spanRef = ref(null);
const tooltipStyle = reactive({ top: '0px', left: '0px' });

watch(show, async val => {
    if (val) {
        await nextTick();
        const rect = spanRef.value.getBoundingClientRect();
        // position tooltip above the span, centered horizontally
        tooltipStyle.top = `${rect.top - 28}px`; // adjust offset as needed
        tooltipStyle.left = `${rect.left + rect.width / 2}px`;
    }
});
</script>

<style scoped>
.custom-tooltip {
    position: fixed;
    transform: translateX(-50%);
    padding: 6px 10px;
    background-color: #333;
    color: white;
    font-size: 12px;
    border-radius: 4px;
    white-space: nowrap;
    z-index: 1050;
    pointer-events: none;
    user-select: none;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    transition: opacity 0.15s ease-in-out;
}
</style>
