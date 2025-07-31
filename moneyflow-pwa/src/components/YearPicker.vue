<template>
    <div class="year-navigation">
        <button class="nav-button" @click="goPrev">‹</button>
        <button class="year-container">
            <span class="year-text"> {{ year }} </span>
            <span class="calendar-icon">📅</span>
        </button>
        <button class="nav-button" @click="goNext">›</button>
    </div>
</template>

<script setup lang="ts">

const props = defineProps<{
    year: number
}>();

const emit = defineEmits(['update']);

function goPrev() {
    emit('update', props.year - 1);
}
function goNext() {
    emit('update', props.year + 1);
}

</script>

<style scoped>
.year-navigation {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: white;
    margin: 16px;
    margin-top: 16px;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.nav-button {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #64748b;
    font-weight: 600;
}
.year-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: none;
    border: none;
    cursor: pointer;
}
.year-text {
    font-size: 24px;
    font-weight: 700;
    color: #1e293b;
}
.calendar-icon {
    font-size: 18px;
    opacity: 0.7;
}
</style>