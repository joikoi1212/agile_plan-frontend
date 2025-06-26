<template>
  <transition name="fade">
    <div class="room-voting-glassy">
      <div class="ticket-info">
        <h3>
          <span class="ticket-key">{{ ticket.key }}</span>
          <span class="ticket-summary">{{ ticket.summary }}</span>
        </h3>
      </div>
      <div class="players-row">
      <div
        v-for="player in players"
        :key="player.id"
        class="player"
        :class="{ admin: player.isAdmin }"
      >
        <div v-if="!revealed" class="player-vote-box">
          <span v-if="votes[player.id] !== undefined" class="player-checkmark-inbox">✔️</span>
          <span v-else class="vote-placeholder">?</span>
        </div>
        <div v-else class="player-vote">
          <span class="vote-number">{{ votes[player.id] !== undefined ? votes[player.id] : "?" }}</span>
        </div>
        <div class="player-name">
          {{ player.name }}
          <span v-if="player.id === myPlayerId" class="me">(You)</span>
          <span v-if="player.isAdmin" class="admin-label">(ADMIN)</span>
        </div>
      </div>
    </div>
      <transition name="fade">
        <div class="cards-row" v-if="!revealed">
          <div
            class="vote-card"
            :class="{ selected: selectedCard === null }"
            @click="selectCard(null)"
            title="No vote"
          >
            <i class="bi bi-slash-circle" style="font-size:1.5rem;color:#bbb;"></i>
          </div>
          <div
            v-for="card in fibonacci"
            :key="card"
            class="vote-card"
            :class="{ selected: selectedCard === card }"
            @click="selectCard(card)"
          >
            {{ card }}
          </div>
        </div>
      </transition>
      <transition name="fade">
        <div class="reveal-row" v-if="revealed">
          <div class="media">
            Média: {{ media }}
          </div>
          <div v-if="isAdmin" class="fib-approx-controls">
            <label>Approximation:
              <select v-model="fibDirection">
                <option value="up">Up</option>
                <option value="down">Down</option>
              </select>
            </label>
          </div>
        </div>
      </transition>
      <div class="actions-row">
        <div class="actions-left">
          <b-button
            v-if="isAdmin && revealed"
            variant="secondary"
            class="return-btn"
            @click="returnToRoom"
          >Return to Room</b-button>
        </div>
        <div class="actions-right">
          <b-button
            v-if="isAdmin && !revealed && allVoted"
            variant="primary"
            class="reveal-btn"
            @click="revealVotes"
          >Reveal</b-button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useWebSocket } from '../../../websocket.js'; 

const props = defineProps({
  ticket: Object,
  players: Array,
  myPlayerId: String,
  isAdmin: Boolean,
});

const emit = defineEmits(['returnToRoom']);
const { sendMessage, addListener, removeListener, isConnected } = useWebSocket();
const fibonacci = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
const selectedCard = ref(null);
const votes = ref({});
const revealed = ref(false);
const fibDirection = ref("up");

const media = computed(() => {
  if (!revealed.value) return "?";
  const numbers = Object.values(votes.value).filter(v => typeof v === "number");
  if (!numbers.length) return "?";
  const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  if (fibDirection.value === "down") {
    for (let i = fibonacci.length - 1; i >= 0; i--) {
      if (fibonacci[i] <= avg) return fibonacci[i];
    }
    return fibonacci[0];
  } else {
    for (let i = 0; i < fibonacci.length; i++) {
      if (fibonacci[i] >= avg) return fibonacci[i];
    }
    return fibonacci[fibonacci.length - 1];
  }
});

const allVoted = computed(() =>
  props.players.every(p => votes.value[p.id] !== undefined)
);


function handleVoteUpdate(msg) {
  votes.value = msg.votes;
}

function handleVotesRevealed(msg) {
  votes.value = msg.votes;
  revealed.value = true;

  if (props.isAdmin) {
    sendMessage({
      action: 'addRoomHistory',
      roomUUID: props.ticket.id,
      ticketName: props.ticket.key,
      date: new Date().toISOString(),
      media: media.value 
    });
  }
}

function handleReturnToRoom(message) {
  const roomTab = tabs.value.find(tab => tab.id === message.roomUUID);
  if (roomTab) {
    roomTab.voting = false;
    roomTab.activeTicket = null; // Hide the active ticket after voting
    showTempNotification("Returned to room view.");
  }
}


onMounted(() => {
   console.log("[RoomVoting] ticket prop:", props.ticket);
  console.log("[RoomVoting] players prop:", props.players);

  addListener('fibApproxChanged', handleFibApproxChanged);
  addListener('voteUpdate', handleVoteUpdate);
  addListener('votesRevealed', handleVotesRevealed);
});


onUnmounted(() => {
  removeListener('fibApproxChanged', handleFibApproxChanged);
  removeListener('voteUpdate', handleVoteUpdate);
  removeListener('votesRevealed', handleVotesRevealed);
});

function selectCard(card) {
  if (revealed.value) return;
  selectedCard.value = card;
   console.log("[RoomVoting] activeTicket (props.ticket):", props.ticket); 
  sendMessage({
    action: 'vote',
    roomUUID: props.ticket.id, 
    playerId: props.myPlayerId,
    value: card,
  });
}

function revealVotes() {
  sendMessage({
    action: 'revealVotes',
    roomUUID: props.ticket.id, 
  });
}

function returnToRoom() {
  sendMessage({
    action: 'returnToRoom',
    roomUUID: props.ticket.id,
  });
}

watch(fibDirection, (newDir) => {
  if (props.isAdmin && revealed.value) {
    sendMessage({
      action: 'fibApproxChanged',
      roomUUID: props.ticket.id,
      direction: newDir,
    });
  }
});

function handleFibApproxChanged(msg) {
  if (msg.direction && msg.roomUUID === props.ticket.id) {
    fibDirection.value = msg.direction;
  }
}

</script>

<style scoped>
.room-voting-glassy {
  width: 100%;
  min-height: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(24, 28, 34, 0.92);
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(31,38,135,0.18);
  animation: fadeIn 0.8s;
  padding: 32px 24px 24px 24px;
  margin: 0 auto;
}

.ticket-info h3 {
  margin: 0 0 18px 0;
  font-size: 1.25rem;
  color: #43cea2;
  text-shadow: 0 2px 8px #23252688;
  display: flex;
  align-items: center;
  gap: 12px;
}
.ticket-key {
  font-family: 'Fira Mono', 'Consolas', monospace;
  background: #232526;
  color: #43cea2;
  padding: 2px 10px;
  border-radius: 6px;
  font-size: 1.08em;
  letter-spacing: 1px;
  margin-right: 10px;
}
.ticket-summary {
  color: #b5b5b5;
  font-size: 1.08em;
}

.players-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 24px;
  gap: 32px;
  width: 100%;
  box-sizing: border-box;
}

.player {
  flex: 0 1 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
  position: relative;
  margin-bottom: 16px;
  background: rgba(67, 206, 162, 0.08);
  border-radius: 10px;
  padding: 10px 8px 8px 8px;
  box-shadow: 0 2px 8px #43cea222;
  transition: background 0.2s;
}
.player.admin {
  border: 1.5px solid #ffb347;
}
.player-checkmark {
  color: #43cea2;
  font-size: 1.5rem;
  position: absolute;
  top: -24px;
}
.player-vote {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 4px;
  color: #43cea2;
}
.player-vote-box {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin-bottom: 8px;
  font-size: 2.2rem;
}

.player-checkmark-inbox {
  color: #43cea2;
  font-size: 2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.vote-placeholder {
  color: #888;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.vote-number {
  font-size: 1.5rem;
  font-weight: 600;
  color: #43cea2;
}
.player-name {
  font-size: 1rem;
  color: #b5b5b5;
}
.me {
  color: #43cea2;
  margin-left: 4px;
}
.admin-label {
  color: #ffb347;
  margin-left: 4px;
}

.cards-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  justify-content: center;
  width: 100%;
}
.vote-card {
  width: 54px;
  height: 72px;
  background: rgba(35, 37, 38, 0.98);
  border: 2px solid #43cea2;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  color: #43cea2;
  transition: border 0.2s, background 0.2s, color 0.2s;
  box-shadow: 0 2px 8px #43cea222;
  font-family: 'Fira Mono', 'Consolas', monospace;
}
.vote-card.selected {
  border: 2.5px solid #ffb347;
  background: #232526;
  color: #ffb347;
}
.vote-card:hover {
  background: #43cea2;
  color: #232526;
}

.reveal-row {
  margin-top: 24px;
  font-size: 1.5rem;
  color: #43cea2;
  display: flex;
  align-items: center;
  gap: 24px;
}
.media {
  font-size: 1.3rem;
  color: #43cea2;
  font-weight: 600;
  background: #232526;
  padding: 6px 18px;
  border-radius: 8px;
  box-shadow: 0 2px 8px #43cea222;
}
.fib-approx-controls label {
  color: #b5b5b5;
  font-size: 1rem;
  margin-left: 12px;
}
.fib-approx-controls select {
  background: #232526;
  color: #43cea2;
  border: 1px solid #43cea2;
  border-radius: 6px;
  padding: 2px 8px;
  margin-left: 6px;
}

.actions-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 32px;
}
.actions-left {
  flex: 1;
  display: flex;
  justify-content: flex-start;
}
.actions-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}
.return-btn {
  background: none;
  color: #43cea2;
  border: 2px solid #43cea2;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.return-btn:hover {
  background: #43cea2;
  color: #181c22;
  border-color: #43cea2;
}
.reveal-btn {
  background: linear-gradient(90deg, #43cea2 0%, #185a9d 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(67,198,172,0.12);
  padding: 10px 24px;
  font-size: 1.1em;
  transition: background 0.2s, box-shadow 0.2s;
}
.reveal-btn:hover {
  background: linear-gradient(90deg, #185a9d 0%, #43cea2 100%);
  color: #fff;
  box-shadow: 0 2px 8px #185a9daa;
}

/* Fade animation */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Glassy pop-in animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px);}
  to { opacity: 1; transform: translateY(0);}
}
</style>