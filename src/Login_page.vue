<template>
  <div class="login-bg2">
    <div class="center-content">
      <div class="animated-cards2">
        <span class="card2">1</span>
        <span class="card2">2</span>
        <span class="card2">5</span>
        <span class="card2">8</span>
        <span class="card2">?</span>
      </div>
      <div class="login-title-row">
        <img src="/src/assets/logo.png" alt="Logo" class="login-logo" />
        <span class="main-title nav-title">PokerPlan</span>
      </div>
      <form v-if="!showDummyInput" @submit.prevent="onJoin" class="login-form2">
    
        <button class="login-btn2" type="button" @click="handleLogin">
          Login via Github
          <svg class="login-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path fill="#fff" d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.66-.22.66-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85.004 1.71.11 2.51.32 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.16.58.67.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z"/>
          </svg>
        </button>
        <button class="dummy-btn2" type="button" @click="showDummyInput = true">
          Create Dummy Account
        </button>
        <button class="info-btn2" type="button" @click="showInfo = !showInfo">
          What is Poker Planning?
        </button>
      </form>
      <transition name="fade">
        <form v-if="showDummyInput" @submit.prevent="submitDummy" class="dummy-form">
          <input v-model="dummyName" class="login-input2" placeholder="Type your guest name..." required autocomplete="off" />
          <button class="dummy-btn2" type="submit">Continue as Guest</button>
          <button class="info-btn2" type="button" @click="showDummyInput = false">Back</button>
        </form>
      </transition>
           <transition name="fade">
        <div v-if="showInfo" class="info-text2">
          Poker Planning is a consensus-based, gamified technique for estimating effort in agile teams. Discuss, vote, reveal, and reach agreement!
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const username = ref('')
const showInfo = ref(false)
const showDummyInput = ref(false)
const dummyName = ref('')
const router = useRouter()

function onJoin() {
  if (username.value) {
    router.push({ path: '/dashboard', query: { username: username.value } })
  }
}
async function handleLogin() {
  try {
    const response = await fetch('https://agileplan-backend-production.up.railway.app/api/v1/login', {
      method: 'GET', 
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.redirect === '/dashboard') {
      router.push('/dashboard');
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (err) {
    alert('Login failed');
  }
}
function submitDummy() {
  if (dummyName.value) {
    router.push({ path: '/dashboard', query: { username: dummyName.value } })
  }
}
</script>

<style scoped>
.login-bg2 {
  min-height: 100vh;
  min-width: 100vw;
  width: 100vw;
  height: 100vh;
  background: #181c22;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
}

.center-content {
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: fadeIn 1s;
}

.animated-cards2 {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}
.card2 {
  width: 38px;
  height: 54px;
  background: linear-gradient(135deg, #232526 0%, #43cea2 100%);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(67,198,172,0.18);
  font-size: 1.3rem;
  font-weight: bold;
  color: #fff;
  text-align: center;
  line-height: 54px;
  animation: cardBounce2 1.2s infinite alternate;
}
.card2:nth-child(2) { animation-delay: 0.15s;}
.card2:nth-child(3) { animation-delay: 0.3s;}
.card2:nth-child(4) { animation-delay: 0.45s;}
.card2:nth-child(5) { animation-delay: 0.6s;}

.main-title {
  color: #fff;
  font-size: 2.1rem;
  font-weight: 700;
  margin-bottom: 18px;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px #23252688;
}

.info-text2 {
  color: #b5b5b5;
  background: #232526;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 18px;
  font-size: 1.02em;
  animation: fadeIn 0.5s;
}

.login-form2,
.dummy-form {
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 18px;
  align-items: center;
}

.login-input2 {
  padding: 10px 12px;
  border-radius: 6px;
  border: none;
  background: #232526;
  color: #fff;
  font-size: 1.1em;
  outline: none;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  transition: background 0.2s;
  width: 100%;
  max-width: 320px;
}
.login-input2:focus {
  background: #232a34;
}
.login-btn2 {
  background: linear-gradient(90deg, #43cea2 0%, #185a9d 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 0;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
  max-width: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-icon {
  vertical-align: middle;
  display: inline-block;
  width: 32px;
  height: 32px;
}

.login-btn2 svg.login-icon {
  width: 32px;
  height: 32px;
}

.login-btn2:hover {
  background: linear-gradient(90deg, #185a9d 0%, #43cea2 100%);
}
.dummy-btn2 {
  background: linear-gradient(90deg, #ffb347 0%, #ffcc33 100%);
  color: #232526;
  border: none;
  border-radius: 6px;
  padding: 10px 0;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
  max-width: 320px;
}
.dummy-btn2:hover {
  background: linear-gradient(90deg, #ffcc33 0%, #ffb347 100%);
}
.info-btn2 {
  background: none;
  border: none;
  color: #aaa;
  font-size: 0.98em;
  cursor: pointer;
  margin-top: 2px;
  text-decoration: underline;
  transition: color 0.2s;
}
.info-btn2:hover {
  color: #fff;
}

.login-title-row {
  display: flex;
  align-items: center;      
  justify-content: center;
  gap: 14px;
  margin-bottom: 18px;
  height: 48px;            
}

.login-logo {
  height: 44px;
  width: 44px;
  border-radius: 8px;
  background: #232526;
  object-fit: contain;
  display: block;
}


@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px);}
  to { opacity: 1; transform: translateY(0);}
}
@keyframes cardBounce2 {
  from { transform: translateY(0);}
  to { transform: translateY(-8px);}
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>