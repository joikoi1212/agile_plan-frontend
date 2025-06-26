<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './components/dashboard_content/Sidebar.vue'
import Nav from './components/Nav.vue'
import Tab_content from './components/dashboard_content/Tab_content.vue';
import JoinRoomPopup from './components/pop-ups/JoinRoomPopup.vue';
import Notification from './components/pop-ups/Notification.vue';
import axios from 'axios';
const route = useRoute();
const tickets = ref([]);
const selectedTicket = ref(null);
const newRoom = ref(null);
const currentUserId = ref(null);
const showJoinRoomPopup = ref(false);
const username = ref('');
const tabContentRef = ref(null);
const notification = ref('');
const showNotification = ref(false);
function showTempNotification(msg) {
  notification.value = msg;
  showNotification.value = true;
}
const fetchTickets = async () => {
  try {
    const response = await axios.get('https://agileplan-backend-production.up.railway.app/api/v1/tickets') 
    tickets.value = response.data.issues
  } catch (error) {
  }
}

const handleJoinRoomError = (msg) => {
  showTempNotification("No room found with this key. Please check the key and try again.");
};

const handleClearTabHistory = () => {
  tabContentRef.value?.clearTabHistory();
};

const handleTicketSelected = (ticket) => {
  if (ticket) {
    selectedTicket.value = ticket; 
  }
};

const handleCreateRoom = (roomDetails) => {
  newRoom.value = roomDetails; 
  currentUserId.value = roomDetails.player.id; 
  username.value = roomDetails.player.name; 
};

const handleShowJoinPopup = (emittedUsername) => {
  username.value = emittedUsername || 'Guest_User'; 
  showJoinRoomPopup.value = true;
};

const confirmJoinRoom = (roomDetails) => {
  currentUserId.value = roomDetails.player.id;
  username.value = roomDetails.player.name;
};

const handleCloseJoinRoomPopup = () => {
  showJoinRoomPopup.value = false; 
};

onMounted(() => {
  // Only fetch tickets if user is authenticated (has a username from query params)
  // Guests can still use the app without tickets
  if (!route.query.username) {
    fetchTickets();
  }
  
  // Ensure we have a username for guests
  if (!username.value) {
    username.value = 'Guest_User';
  }
});

onUnmounted(() => {
});

</script>

<template>
   <Nav  class="nav" @clear-tab-history="handleClearTabHistory"  @create-room="handleCreateRoom" @show-join-popup="handleShowJoinPopup" ></Nav> 
   
   <div class="main">
    <Sidebar class="sidebar" :tickets="tickets" @ticket-selected="handleTicketSelected" />
    <Tab_content class="tab-content" ref="tabContentRef" :ticketSelected="selectedTicket" :username="username" :showJoinRoomPopup="showJoinRoomPopup" :newRoom="newRoom" :myPlayerId="currentUserId" @closeJoinRoomPopup="handleCloseJoinRoomPopup" @joinRoomError="handleJoinRoomError"/>
    <JoinRoomPopup
      v-if="showJoinRoomPopup"
      :playerName="username"
      @confirmJoinRoom="confirmJoinRoom"
      @close="handleCloseJoinRoomPopup"
       @joinRoomError="handleJoinRoomError"
    />
    <Notification v-model:show="showNotification" :message="notification" />
  </div>
</template>

<style scoped>
  .main {
    display: flex;
    flex-direction: row;
    height: 90%; 
    width: 100vw;
  }

  .nav {
    width: 100vw;
    height: 10%; 
    background: linear-gradient(90deg, #232526 0%, #181c22 100%);
    box-shadow: 0 2px 12px #43cea222;
    border-bottom: 2px solid #ffffff;
    z-index: 100; 
  }

  .sidebar {
  width: 20%;
  height: 100%;
  background-color: #f0f0f0; 
  border-right: 1px solid #ccc; 
}

  .tab-content {
    width: 80%;
    height: 100%;
  }
  
  .notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #232526;
  color: #43cea2;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 16px #43cea244;
  z-index: 2000;
  opacity: 0.97;
  font-weight: 500;
  transition: opacity 0.5s;
}

</style>

