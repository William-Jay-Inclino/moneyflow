<template>
    <input
        type="text"
        :class="inputClass"
        :value="inputValue"
        @input="onInput"
        @blur="formatValue"
        @focus="unformatValue"
        @paste="onPaste"
        @keydown="onKeydown"
        required
        placeholder="0.00"
    />
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
    modelValue: {
        type: Number,
        required: true
    },
    inputClass: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:modelValue'])

const inputValue = ref('')

// Format number with commas
function formatNumber(num) {
    return num.toLocaleString('en-US')
}

// Remove commas from string
function unformatNumber(str) {
    return str.replace(/,/g, '')
}

// Sync external modelValue to inputValue
watch(() => props.modelValue, (newVal) => {
    inputValue.value = formatNumber(newVal)
}, { immediate: true })

// Only allow numbers and at most one decimal point
function sanitizeInput(str) {
    // Remove all except digits and decimal point
    let sanitized = str.replace(/[^0-9.]/g, '')
    // Only allow one decimal point
    const parts = sanitized.split('.')
    if (parts.length > 2) {
        sanitized = parts[0] + '.' + parts.slice(1).join('')
    }
    return sanitized
}

// Emit clean number when typing
function onInput(e) {
    let sanitized = sanitizeInput(e.target.value)
    const numeric = Number(sanitized)
    if (!isNaN(numeric)) {
        emit('update:modelValue', numeric)
        inputValue.value = sanitized
    } else {
        inputValue.value = ''
        emit('update:modelValue', 0)
    }
}

// Handle paste event to only allow numbers
function onPaste(e) {
    e.preventDefault()
    const pasted = (e.clipboardData || window.clipboardData).getData('text')
    const sanitized = sanitizeInput(pasted)
    document.execCommand('insertText', false, sanitized)
}

// Format with commas on blur
function formatValue() {
    inputValue.value = formatNumber(props.modelValue)
}

// Show raw number on focus
function unformatValue() {
    inputValue.value = props.modelValue.toString()
}

// Prevent non-numeric key input (allow digits, one dot, navigation, backspace, etc.)
function onKeydown(e) {
    const allowedKeys = [
        'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'
    ]
    // Allow: Ctrl/Cmd+A/C/V/X/Z/Y
    if (
        e.ctrlKey || e.metaKey ||
        allowedKeys.includes(e.key)
    ) {
        return
    }
    // Allow one dot if not already present
    if (e.key === '.') {
        if (e.target.value.includes('.')) {
            e.preventDefault()
        }
        return
    }
    // Allow digits
    if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault()
    }
}
</script>

