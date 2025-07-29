<template>
    <div class="expense-date-picker">
        <div class="date-display" @click="showModal = true">
            <span class="date-text">{{ displayMonthYear }} 🗓️</span>
        </div>
        <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
            <div class="modal-content">
                <div class="modal-header">
                    <span>Select Month & Year</span>
                </div>
                <div class="modal-selects">
                    <select v-model="selectedMonth" class="date-select month-select" @change="emitChange">
                        <option v-for="(month, idx) in months" :key="month" :value="idx + 1">
                            {{ month }}
                        </option>
                    </select>
                    <select v-model="selectedYear" class="date-select year-select" @change="emitChange">
                        <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn cancel" @click="showModal = false">Cancel</button>
                    <button class="modal-btn confirm" @click="emitChange(); showModal = false;">Confirm</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits } from 'vue';

const props = defineProps<{
    modelValue?: { year: number, month: number }
}>();
const emit = defineEmits(['update:modelValue']);

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

const years = computed(() => {
    const arr = [];
    for (let y = currentYear - 5; y <= currentYear + 2; y++) arr.push(y);
    return arr;
});
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const monthsShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const selectedYear = ref(props.modelValue?.year ?? currentYear);
const selectedMonth = ref(props.modelValue?.month ?? currentMonth);

const showModal = ref(false);

const displayMonthYear = computed(() => {
    return `${monthsShort[selectedMonth.value - 1]} ${selectedYear.value}`;
});

watch(() => props.modelValue, (val) => {
    if (val) {
        selectedYear.value = val.year;
        selectedMonth.value = val.month;
    }
});

function emitChange() {
    emit('update:modelValue', { year: selectedYear.value, month: selectedMonth.value });
}
</script>

<style scoped>
.expense-date-picker {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: stretch;
}

.date-display {
    width: 100%;
    cursor: pointer;
    font-size: 1.18rem;
    font-weight: 600;
    color: #1e293b;
    padding: 0.85rem 1.2rem;
    border-radius: 10px;
    background: #fff;
    border: 2px solid #e0e7ef;
    box-shadow: 0 2px 8px 0 rgba(30, 64, 175, 0.07);
    transition: border 0.18s, box-shadow 0.18s, background 0.18s;
    outline: none;
    letter-spacing: 0.02em;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 48px;
    text-align: center;
    position: relative;
    gap: 0.7em;
}
.date-display:hover, .date-display:focus {
    border-color: #38bdf8;
    box-shadow: 0 4px 16px 0 rgba(56, 189, 248, 0.09);
    background: #f0f9ff;
}
.calendar-icon {
    display: inline-block;
    vertical-align: middle;
    margin-right: 0.2em;
    flex-shrink: 0;
}
.date-text {
    flex: 1;
    text-align: center;
    display: inline-block;
}

.modal-backdrop {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(30, 41, 59, 0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: #fff;
    border-radius: 16px;
    padding: 2.2rem 2.5rem 2rem 2.5rem;
    box-shadow: 0 8px 32px 0 rgba(30, 64, 175, 0.16);
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    min-width: 340px;
    max-width: 94vw;
    width: 100%;
    max-width: 400px;
    animation: modalFadeIn 0.18s;
}

@keyframes modalFadeIn {
    from { opacity: 0; transform: translateY(24px);}
    to { opacity: 1; transform: translateY(0);}
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.15rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 0.5rem;
}

.modal-close-btn {
    background: none;
    border: none;
    font-size: 1.7rem;
    color: #64748b;
    cursor: pointer;
    padding: 0 0.3rem;
    border-radius: 50%;
    transition: background 0.15s;
}
.modal-close-btn:hover {
    background: #f1f5f9;
    color: #0ea5e9;
}

.modal-selects {
    display: flex;
    gap: 1.2rem;
    width: 100%;
    justify-content: center;
}

.date-select {
    border: 1.5px solid #e0e7ef;
    border-radius: 8px;
    background: #f8fafc;
    color: #334155;
    font-size: 1.08rem;
    padding: 0.65rem 1.2rem 0.65rem 0.8rem;
    outline: none;
    transition: border 0.18s, background 0.18s;
    font-weight: 500;
    appearance: none;
    box-shadow: none;
    min-width: 120px;
}
.date-select:focus {
    border-color: #38bdf8;
    background: #f0f9ff;
}
.year-select {
    min-width: 90px;
}
.month-select {
    min-width: 120px;
}

.modal-actions {
    display: flex;
    justify-content: stretch;
    gap: 0;
    margin-top: 0.5rem;
    width: 100%;
    padding: 0;
    margin-bottom: 0;
}

.modal-btn {
    flex: 1 1 0;
    width: 50%;
    padding: 0.9rem 0;
    border-radius: 0 0 0 16px;
    font-size: 1.04rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: background 0.16s, color 0.16s;
    border-top: 1.5px solid #e0e7ef;
    border-right: 0.75px solid #e0e7ef;
    border-left: none;
    margin: 0;
    /* Remove side and bottom padding/margin */
    box-sizing: border-box;
}
.modal-btn.cancel {
    background: #f1f5f9;
    color: #64748b;
    border-radius: 0 0 0 16px;
    border-right: 0.75px solid #e0e7ef;
}
.modal-btn.cancel:hover {
    background: #e0e7ef;
    color: #334155;
}
.modal-btn.confirm {
    background: #38bdf8;
    color: #fff;
    border-radius: 0 0 16px 0;
    border-left: 0.75px solid #e0e7ef;
}
.modal-btn.confirm:hover {
    background: #0ea5e9;
    color: #fff;
}
</style>
