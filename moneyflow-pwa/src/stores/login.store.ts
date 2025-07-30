import { defineStore } from "pinia"
import { ref } from "vue"

export const useLoginStore = defineStore('login', () => {

    const pendingVerificationEmail = ref<string | null>(null)
    const pendingVerificationUserId = ref<string | null>(null)

    function setPendingVerification(email: string | null, userId: string | null) {
        pendingVerificationEmail.value = email
        pendingVerificationUserId.value = userId
    }

    function clearPendingVerification() {
        pendingVerificationEmail.value = null
        pendingVerificationUserId.value = null
    }

    return {
        pendingVerificationEmail,
        pendingVerificationUserId,
        setPendingVerification,
        clearPendingVerification
    }

})