<template>
    <div class="flex items-center justify-center pt-5">
        <form class="bg-white p-8 rounded-lg w-full max-w-md flex flex-col gap-6 border border-gray-200" @submit.prevent="onLogin">
            <h2 class="text-2xl font-semibold text-center text-gray-800 mb-2">Login</h2>
            <div class="flex flex-col gap-2">
                <label for="username" class="text-gray-600 text-base">Email</label>
                <input id="username" v-model="email" type="email" placeholder="Enter your email" required
                    class="px-4 py-3 border border-gray-200 rounded bg-gray-50 text-base focus:outline-none focus:border-blue-500 focus:bg-white transition-shadow shadow-none" />
            </div>
            <div class="flex flex-col gap-2">
                <label for="password" class="text-gray-600 text-base">Password</label>
                <input id="password" v-model="password" type="password" placeholder="Enter your password" required
                    class="px-4 py-3 border border-gray-200 rounded bg-gray-50 text-base focus:outline-none focus:border-blue-500 focus:bg-white transition-shadow shadow-none" />
            </div>
            <button
                :disabled="is_logging_in"
                type="submit"
                :class="[
                    'py-3 px-4 rounded font-semibold text-base transition-shadow shadow-none',
                    is_logging_in
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                ]"
            >
                {{ is_logging_in ? 'Logging in...' : 'Login' }}
            </button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { authApi } from '../api'
import { useGlobalStore } from '../global.store'

const store = useGlobalStore()
const email = ref('')
const password = ref('')
const is_logging_in = ref(false)    

async function onLogin() {
    
    is_logging_in.value = true
    const res = await authApi.login({
        email: email.value,
        password: password.value
    })
    is_logging_in.value = false

    if(res.user && res.accessToken) {
        store.is_authenticated = true
        store.set_auth_user({
            user_id: res.user.id,
            email: res.user.email,
            token: res.accessToken
        })
    }

}
</script>


