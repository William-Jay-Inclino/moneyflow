import { defineStore } from "pinia"
import type { UserAccount } from "../types"
import { ref } from "vue"

export const useUserAccountStore = defineStore('user-account', () => {

    const accounts = ref<UserAccount[]>([])
    const formData = ref({
        name: '',
        balance: 0,
        notes: '',
    })

    function setAccounts(_accounts: UserAccount[]) {
        accounts.value = _accounts
    }

    function addAccount(account: UserAccount) {
        accounts.value.unshift(account)
    }

    function updateAccount(updatedAccount: UserAccount) {
        const index = accounts.value.findIndex(acc => acc.id === updatedAccount.id)
        if (index !== -1) {
            accounts.value[index] = updatedAccount
        }
    }

    function removeAccount(id: string) {
        accounts.value = accounts.value.filter(acc => acc.id !== id)
    }

    return {
        accounts,
        formData,
        setAccounts,
        addAccount,
        updateAccount,
        removeAccount
    }

})