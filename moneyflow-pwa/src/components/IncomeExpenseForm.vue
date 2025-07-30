<template>
    <form class="soft-card p-3 mb-3 quick-add-form" @submit.prevent="handleAdd">
        <div class="row g-2 mb-3">
            <div class="col-4">
                <label class="form-label input-label">Amount</label>
                <input
                    class="form-control cost-input"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    v-model="amount"
                    :disabled="isLoading"
                    required
                />
            </div>
            <div class="col-8">
                <label class="form-label input-label">Notes</label>
                <input
                    class="form-control notes-input"
                    type="text"
                    v-model="notes"
                    :disabled="isLoading"
                    required
                />
            </div>
        </div>
        <div class="mb-3 category-section">
            <label class="form-label input-label">Category</label>
            <div class="d-flex flex-wrap gap-1 category-scroll justify-content-start">
                <button
                    v-for="category in categories"
                    :key="category.id"
                    type="button"
                    class="btn btn-soft px-1 py-1 category-chip"
                    :class="{ active: selectedCategory?.id === category.id }"
                    style="min-width: 0; font-size: 0.88rem; line-height: 1.05; height: 26px; border-radius: 10px; padding: 2px 7px;"
                    @click="selectedCategory = category"
                >
                    <span class="category-icon me-1" style="font-size: 1rem;">{{ category.icon }}</span>
                    <span>{{ category.name }}</span>
                </button>
                <span v-if="categories.length === 0" class="text-muted loading-categories">
                    Loading categories...
                </span>
            </div>
        </div>
        <div class="mb-3">
            <label class="form-label input-label">Day</label>
            <input
                style="width: 20%;"
                class="form-control"
                min="1"
                max="31"
                type="number"
                v-model="day"
                :disabled="isLoading"
                required
            />
        </div>
        <button
            class="btn btn-soft-primary w-100 quick-add-button"
            :disabled="isLoading || categories.length === 0"
            type="submit"
        >
            <span v-if="isLoading">Adding...</span>
            <span v-else-if="categories.length === 0">Loading...</span>
            <span v-else>+ Add {{ type === 'expense' ? 'Expense' : 'Income' }}</span>
        </button>
    </form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Category } from '../types';
import { useCategoryStore } from '../stores/category.store';

const props = defineProps<{
    type: 'expense' | 'income';
    isLoading?: boolean;
}>();

const emit = defineEmits<{
    (e: 'add', payload: { notes: string; amount: string; category: Category; day: number }): void;
    (e: 'update'): void;
}>();

const categoryStore = useCategoryStore();

const notes = ref('');
const amount = ref('');
const selectedCategory = ref<Category>();
const day = ref(new Date().getDate());

const categories = computed(() => {
    return props.type === 'expense'
        ? categoryStore.expenseCategories
        : categoryStore.incomeCategories;
});

function handleAdd() {

    if(selectedCategory.value === undefined) {
        alert('Please select a category');
        return;
    }

    emit('add', {
        notes: notes.value,
        amount: amount.value.toString(),
        category: selectedCategory.value,
        day: day.value
    });

    resetForm();
}

function resetForm() {
    notes.value = '';
    amount.value = '';
    selectedCategory.value = undefined;
    day.value = new Date().getDate();
}

</script>

