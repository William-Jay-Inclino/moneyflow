

<template>
  <div class="flex justify-center mt-8">
    <div class="bg-white rounded-lg p-6 flex flex-col space-y-8 w-48">
      <button
        v-for="year in years"
        :key="year"
        @click="setActiveYear(year)"
        :class="[
          'px-6 py-3 rounded-md text-base font-medium transition',
          activeYear === year
            ? 'bg-blue-500 text-white shadow'
            : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
        ]"
      >
        {{ year }}
      </button>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue';
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
const activeYear = ref(currentYear);

function setActiveYear(year: number) {
  activeYear.value = year;
}
</script>



<style scoped>
/* No extra styles needed, all handled by Tailwind classes */
</style>
