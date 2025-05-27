<template>
  <transition name="fade">
    <div class="popup-overlay" v-if="visible">
      <div class="popup-glassy">
        <h3 class="popup-title">Do you want to leave the room?</h3>
        <form @submit.prevent="submitLeave" class="popup-form">
          <div class="popup-actions">
            <button type="submit" class="start-vote-btn">Yes</button>
            <button type="button" class="cancel-btn" @click="closePopup">
              No
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue';
import { useWebSocket } from '../../websocket.js';

const visible = ref(true);
const emit = defineEmits(['close']);

const props = defineProps({
  roomId: {
    type: String,
    required: true,
  },
  playerId: {
    type: String,
    required: true,
  },
});

const { sendMessage, isConnected } = useWebSocket();

const submitLeave = () => {
  if (!isConnected.value) {
    alert('WebSocket is not connected. Please try again.');
    return;
  }
  sendMessage({
    action: 'leaveRoom',
    roomUUID: props.roomId,
    playerUUID: props.playerId,
  });
  emit('close');
  visible.value = false;
};

const closePopup = () => {
  emit('close');
  visible.value = false;
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(24, 28, 34, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.popup-glassy {
  background: linear-gradient(135deg, #232526 0%, #181c22 100%);
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(67,198,172,0.18);
  padding: 36px 32px 28px 32px;
  min-width: 340px;
  max-width: 94vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: popIn 0.7s;
}

.popup-title {
  color: #43cea2;
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 18px;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px #23252688;
  text-align: center;
}

.popup-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.popup-actions {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.start-vote-btn {
  min-width: 100px;
  font-size: 1.08rem;
  background: linear-gradient(90deg, #43cea2 0%, #185a9d 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(67,198,172,0.12);
  transition: background 0.2s, box-shadow 0.2s;
  padding: 10px 0;
  cursor: pointer;
}
.start-vote-btn:hover {
  background: linear-gradient(90deg, #185a9d 0%, #43cea2 100%);
  box-shadow: 0 2px 8px #185a9daa;
  color: #fff;
}

.cancel-btn {
  min-width: 100px;
  font-size: 1.08rem;
  background: none;
  color: #ffb347;
  border: 2px solid #ffb347;
  border-radius: 8px;
  font-weight: 600;
  padding: 10px 0;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.cancel-btn:hover {
  background: #ffb347;
  color: #232526;
  border-color: #ffb347;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.95);}
  to { opacity: 1; transform: scale(1);}
}
</style>