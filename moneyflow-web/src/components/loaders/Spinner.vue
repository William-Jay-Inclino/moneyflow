<template>
    <div class="spinner-container">
        <div class="spinner">
            <div class="spinner-inner"></div>
        </div>
        <p class="loading-text text-muted fst-italic">
            Loading... please wait
        </p>
    </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.spinner-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 20vh;
}

.spinner {
    width: 48px;   /* smaller */
    height: 48px;  /* smaller */
    position: relative;
}

.spinner-inner {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 36px;   /* smaller */
    height: 36px;  /* smaller */
    margin: 6px;   /* adjust for new size */
    border: 4px solid #ccc; /* thinner border */
    border-radius: 50%;
    animation: spinner 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: #ccc transparent transparent transparent;
}

.loading-text {
    font-size: 15px;
    margin-top: 14px;
}

@keyframes spinner {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>