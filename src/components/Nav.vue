<template>
  <nav class="navbar navbar-expand-lg custom-navbar">
    <div class="nav-inner">
      <div class="left-group">
         <a href="https://agile-plan-backend.vercel.app/" class="brand-link">
          <img src="../assets/logo.png" class="logo-img" />
          <span class="title navbar-brand mb-0 h1">PokerPlan</span>
        </a>
      </div>
      <div class="nav-actions">
        <button
          class="nav-btn"
          @click="tryShowCreateRoom"
          type="button"
        >
          Create Room
        </button>
        <RoomPopup
          v-if="showPopup"
          @submit="handleRoomPopupSubmit"
          @close="showPopup = false"
        />
        <button
          class="nav-btn"
          @click="tryShowJoinRoom"
          type="button"
        >
          Join Room
        </button>
        <button class="nav-btn nav-btn-clear" @click="clearTabHistoryAndRedirect">
          Clear Tab History
        </button>
        <div class="github-img" @click="clickedProfile = !clickedProfile">
          <img :src="avatar" alt="User Avatar" class="rounded-circle avatar-img" />
          <div v-if="clickedProfile" class="info-box ticket-info-box">
            <h3>{{ username }}</h3>
          
          </div>
        </div>
      </div>
    </div>
    
  </nav>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { computed, ref, onMounted, watch } from 'vue';
import { useWebSocket } from '../websocket.js';
import RoomPopup from './pop-ups/RoomPopup.vue';

const router = useRouter();
const route = useRoute();
const clickedProfile = ref(false);
const showPopup = ref(false);
const emit = defineEmits(['create-room', 'show-join-popup']);
const username = ref(route.query.username || 'Guest_User');
const avatar = ref('');
const { connect, sendMessage, addListener, isConnected } = useWebSocket();

const props = defineProps({
  tabs: {
    type: Array,
    default: () => []
  },
  myPlayerId: String
});

const isInRoom = computed(() => {
  return props.tabs.some(tab =>
    tab.type === 'room' &&
    tab.players.some(p => p.id === props.myPlayerId)
  );
});

function logout() {
  window.location.href = "http://localhost:8088/api/v1/logout";
}
const fetchSession = async () => {
  try {
    const response = await fetch('https://agileplan-backend-production.up.railway.app/api/v1/session', {
      credentials: 'include',
    });
    const data = await response.json();
    username.value = data.username;
    avatar.value = data.avatar;
  } catch (error) {
    console.error('Failed to fetch session data:', error);
    // Set default guest username if session fetch fails
    if (!username.value) {
      username.value = 'Guest_User';
    }
  }
};

function tryShowCreateRoom() {
  if (isInRoom.value) {
    showTempNotification("You are already in a room. Leave it before creating or joining another.");
    return;
  }
  showPopup.value = true;
}

function tryShowJoinRoom() {
  if (isInRoom.value) {
    showTempNotification("You are already in a room. Leave it before creating or joining another.");
    return;
  }
  emit('show-join-popup', username.value);
}


const createRoom = (roomName, playerName) => {
  if (!isConnected.value) {
    console.error('WebSocket is not connected. Retrying...');
    const retryInterval = setInterval(() => {
      if (isConnected.value) {
        clearInterval(retryInterval);
        const message = {
          action: 'createRoom',
          roomname: roomName,
          playerName: playerName,
        };
        sendMessage(message);
        console.log('WebSocket message sent after retry.');
      }
    }, 100);
    return;
  }

  const message = {
    action: 'createRoom',
    roomname: roomName,
    playerName: playerName,
  };

  sendMessage(message);
};

const handleRoomPopupSubmit = (roomName) => {
  showPopup.value = false;
  // Ensure we have a username, default to Guest_User if not set
  const playerName = username.value || 'Guest_User';
  createRoom(roomName, playerName);
};

const clearTabHistoryAndRedirect = () => {
  localStorage.removeItem('tabs');
  emit('clear-tab-history');
  router.push('/dashboard');
};

watch(
  () => props.tabs,
  (newTabs) => {
    console.log('Nav.vue received updated tabs:', newTabs);
  },
  { deep: true }
);

onMounted(async () => {
  if (!route.query.username) {
    await fetchSession();
  }
  // Ensure we have a username after session fetch or route check
  if (!username.value) {
    username.value = 'Guest_User';
  }
  connect();

  addListener('roomCreated', (message) => {
    emit('create-room', {
      id: message.room.id,
      name: message.room.name,
      key: message.room.key,
      admin: message.player.name,
      player: {
        id: message.player.id,
        name: message.player.name,
        isAdmin: message.player.isAdmin,
      },
    });
  });
});
</script>

<style scoped>
.custom-navbar {
  background: linear-gradient(90deg, #232526 0%, #181c22 100%);
  padding: 0;
  min-height: 64px;
  box-shadow: 0 2px 12px #43cea222;
  border-bottom: 2px solid #43cea2;
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 32px;
}

.logo-img {
  height: 44px;
  margin-right: 14px;
  border-radius: 8px;
  background: #232526;
  vertical-align: middle; 
}

.brand-link {
  text-decoration: none;
  display: flex;
  align-items: center;
  margin-right: 0;
}

.title {
  color: #fff;
  font-size: 2.1rem;
  font-weight: 700;
  margin-bottom: 0;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px #23252688;
  margin-left: 0;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-left: auto; 
}

.nav-btn {
  min-width: 120px;
  font-size: 1.08rem;
  background: linear-gradient(90deg, #43cea2 0%, #185a9d 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(67,198,172,0.12);
  transition: background 0.2s, box-shadow 0.2s, color 0.2s;
  padding: 10px 18px;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-btn:hover {
  background: linear-gradient(90deg, #185a9d 0%, #43cea2 100%);
  color: #ffb347;
  box-shadow: 0 2px 8px #185a9daa;
}

.nav-btn-clear {
  background: none;
  color: #ffb347;
  border: 2px solid #ffb347;
  font-weight: 600;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.nav-btn-clear:hover {
  background: #ffb347;
  color: #232526;
  border-color: #ffb347;
}

.github-img {
  margin-left: 18px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.avatar-img {
  height: 50px;
  width: 50px;
  border-radius: 50%;
  border: 2px solid #43cea2;
  box-shadow: 0 2px 8px #43cea222;
  object-fit: cover;
  background: #232526;
}



.info-box {
  position: absolute;
  top: 110%;
  right: 0;
  min-width: 160px;
  background: #232526;
  color: #43cea2;
  border: 2px solid #43cea2;
  border-radius: 12px;
  z-index: 1000;
  padding: 16px 18px;
  box-shadow: 0 4px 16px #43cea244;
  text-align: center;
  animation: popIn 0.4s;
}

.info-box h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #43cea2;
  letter-spacing: 1px;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.95);}
  to { opacity: 1; transform: scale(1);}
}
</style>
