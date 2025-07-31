<template>
    <div
        class="main-header d-flex flex-column align-items-center justify-content-center mb-3"
        :style="{ backgroundColor: color }"
    >
        <h2 class="main-title mb-1">{{ title }}</h2>
        <div v-if="subtitle" class="main-subtitle">{{ subtitle }}</div>
    </div>
</template>

<script setup>

const props = defineProps({
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    color: { type: String, default: '#3b82f6' }
});
</script>

<style scoped>
.main-header {
    padding-top: 28px;
    padding-bottom: 20px;
    padding-left: 16px;
    padding-right: 16px;
    border-bottom-left-radius: 18px;
    border-bottom-right-radius: 18px;
    margin-bottom: 20px;
}
.main-title {
    font-size: 24px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 2px;
    text-align: center;
    letter-spacing: 0.5px;
}
.main-subtitle {
    font-size: 14px;
    color: #e0e7ff;
    opacity: 0.92;
    text-align: center;
    font-weight: 400;
    letter-spacing: 0.2px;
}
</style>