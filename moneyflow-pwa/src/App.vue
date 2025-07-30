
<template>
    <div>

        <div v-if="!authStore.isAuthenticated">
            <Login v-if="route === 'login'" @signup="setRoute('signup')"/>
            <Signup v-else-if="route === 'signup'" 
                @login="setRoute('login')"
                @email-verification="setRoute('email-verification')"
            />
            <EmailVerification v-else-if="route === 'email-verification'" 
                :email="loginStore.pendingVerificationEmail"
                :userId="loginStore.pendingVerificationUserId"
                @signup="setRoute('signup')"
                @login="setRoute('login')"
            />
        </div>

        <div v-else>
            <Main />
        </div>
        
        <PWABadge />
    </div>
</template>


<script setup lang="ts">
    import { ref } from 'vue';
    import Login from './components/Login.vue';
    import Signup from './components/Signup.vue';
    import EmailVerification from './components/EmailVerification.vue';
    import Main from './components/Main.vue';
    import PWABadge from './components/PWABadge.vue'
    import { useAuthStore } from './stores/auth.store';
    import { useLoginStore } from './stores/login.store';

    const authStore = useAuthStore();
    const loginStore = useLoginStore();

    type route = 'login' | 'signup' | 'email-verification'

    const route = ref<route>('login')

    const setRoute = (newRoute: route) => {
        route.value = newRoute;
    };

</script>


