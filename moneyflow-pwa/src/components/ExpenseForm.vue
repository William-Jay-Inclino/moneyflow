<template>
    <form class="soft-card p-3 mb-3 quick-add-form" @submit.prevent="handleAddExpense">
        <div class="row g-2 mb-3">
            <div class="col-4">
                <label class="form-label input-label">Cost</label>
                <input
                    class="form-control cost-input"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    v-model="cost"
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
                    :class="{ active: selectedCategory === category.id }"
                    style="min-width: 0; font-size: 0.88rem; line-height: 1.05; height: 26px; border-radius: 10px; padding: 2px 7px;"
                    @click="selectedCategory = category.id"
                >
                    <span class="category-icon me-1" style="font-size: 1rem;">{{ category.icon }}</span>
                    <span>{{ category.name }}</span>
                </button>
                <span v-if="categories.length === 0" class="text-muted loading-categories">
                    Loading categories...
                </span>
            </div>
        </div>
        <div class="mb-3" v-if="showDay">
            <label class="form-label input-label">Day</label>
            <input
                style="width: 20%;"
                class="form-control"
                min="1"
                max="31"
                type="number"
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
            <span v-else>+ Add Expense</span>
        </button>
    </form>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    showDay: {
        type: Boolean,
        default: false
    }
});

const isLoading = ref(false);
const notes = ref('');
const cost = ref('');
const selectedCategory = ref('');
const categories = ref([
    { id: '1', name: 'Food', icon: '🍔' },
    { id: '2', name: 'Transport', icon: '🚌' },
    { id: '3', name: 'Shopping', icon: '🛒' },
    { id: '4', name: 'Bills', icon: '💡' },
    { id: '5', name: 'Health', icon: '💊' },
    { id: '6', name: 'Groceries', icon: '🛍️' },
    { id: '7', name: 'Coffee', icon: '☕' },
    { id: '8', name: 'Subscriptions', icon: '📺' },
    { id: '9', name: 'Travel', icon: '✈️' },
    { id: '10', name: 'Gifts', icon: '🎁' },
    { id: '11', name: 'Pets', icon: '🐾' },
    { id: '12', name: 'Other', icon: '📝' }
]);

function handleAddExpense() {
    notes.value = '';
    cost.value = '';
    selectedCategory.value = '';
}
</script>

