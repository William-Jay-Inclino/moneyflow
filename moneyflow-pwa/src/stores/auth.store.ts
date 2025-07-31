import { defineStore } from "pinia"
import { computed, onMounted, ref } from "vue"
import type { AuthUser } from "../types"
import { AUTH_KEY } from "../utils/config"

export const useAuthStore = defineStore('auth', () => {

    const authUser = ref<AuthUser | null>(null)
    const isAuthenticated = computed(() => !!authUser.value)
    
    onMounted(async() => {

        const userLocal = localStorage.getItem(AUTH_KEY)
        if (userLocal) {
            try {
                authUser.value = JSON.parse(userLocal)
            } catch (e) {
                console.warn('Failed to parse auth user from localStorage:', e)
            }
        }

    })

    function setAuthUser(user: AuthUser) {
        authUser.value = user
        localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    }

    function logout() {
        authUser.value = null
        localStorage.removeItem(AUTH_KEY)
    }

    return {
        authUser,
        isAuthenticated,
        setAuthUser,
        logout
    }

})