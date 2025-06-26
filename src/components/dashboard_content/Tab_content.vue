<template>
  <div class="main-content">
    <b-card no-body>
      <b-tabs card>
        <b-tab v-for="tab in tabs" :key="'dyn-tab-' + tab.key">
          <template #title>
            <span class="tab-title">
              {{ tab.type === 'room' ? tab.name : tab.key }}
              <button type="button" class="close-button" @click.stop="closeTab(tab.id, tab.key, tab.type, getIsAdmin(tab), myPlayerId)">×</button>
            </span>
          </template>
          <b-card v-if="tab.type === 'ticket'" class="ticket-card">
            <h3>{{ tab.key }}</h3>
            <h4>Summary:</h4>
            <p>{{ tab.summary }}</p>
            <div v-if="tab.description">
              <div v-for="(lines, title) in tab.description" :key="title" class="description-section">
                <h5>{{ title }}</h5>
                <p v-for="line in lines" :key="line">{{ line }}</p>
              </div>
            </div>
            <p v-else>No description available.</p>
          </b-card>
          <b-card
              v-else-if="tab.type === 'room'"
              class="room-card room-card-wrapper"
              :data-id="tab.id"
              @drop="onDrop"
              @dragover.prevent="onDragOver"
            >
              <template v-if="!tab.voting">
              <transition name="history-slide">
                <div
                  v-if="tab.showHistory"
                  class="room-history-bar open"
                  style="position: absolute; top: 0; right: 0; height: 100%; z-index: 30;"
                >
                  <div class="history-toggle-middle history-close" @click="tab.showHistory = false">
                    <span>&gt;</span>
                  </div>
                  <div class="history-content">
                    <h5>History</h5>
                    <ul class="history-list">
                      <li v-for="(item, idx) in tab.history || []" :key="item.date + item.ticketName + idx" class="history-item">
                        <div class="history-main">
                          <span class="history-ticket">{{ item.ticketName }}</span>
                          <span class="history-media" v-if="item.media !== undefined && item.media !== null">
                            Média: <b>{{ item.media }}</b>
                          </span>
                        </div>
                        <div class="history-date">{{ new Date(item.date).toLocaleString() }}</div>
                      </li>
                      <li v-if="!tab.history || tab.history.length === 0" class="history-empty">
                        No history yet.
                      </li>
                    </ul>
                  </div>
                </div>
              </transition>
              <div v-if="!tab.showHistory" class="room-history-toggle-collapsed" style="z-index:20; position:absolute; top:50%; right:0;">
                <div class="history-toggle-middle history-close" @click="tab.showHistory = true">
                  <span>&lt;</span>
                </div>
              </div>
            </template>
              <div v-if="!tab.showHistory" class="room-history-toggle-collapsed" style="z-index:1001; position:absolute; top:50%; right:0;">
              <div class="history-toggle-middle history-close" @click="tab.showHistory = true">
                <span>&lt;</span>
              </div>
              </div>
              <transition name="fade" mode="out-in">
                <div v-if="tab.voting" :key="'voting'">
                  <RoomVoting
                    :ticket="tab.activeTicket || { key: 'No Ticket', summary: 'Voting without specific ticket', id: tab.id }"
                    :players="tab.players"
                    :myPlayerId="myPlayerId"
                    :isAdmin="getIsAdmin(tab)"
                    :ws="websocketInstance"
                    @returnToRoom="tab.voting = false"
                  />
                </div>
                <div v-else class="room-layout">
                  <div class="room-header-row">
                    <div class="room-name">
                      <h3>{{ tab.name }}</h3>
                    </div>
                    <div class="room-key">
                      <b-button
                        size="sm"
                        class="copy-key-btn"
                        @click="copy(tab.key); showTempNotification('Room key copied!')"
                        title="Copy Room Key"
                      >
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                          <rect x="5" y="5" width="10" height="12" rx="2" stroke="#43cea2" stroke-width="2" fill="none"/>
                          <rect x="3" y="3" width="10" height="12" rx="2" stroke="#43cea2" stroke-width="1" fill="none"/>
                        </svg>
                        <span class="copy-label">Copy Room Key</span>
                      </b-button>
                    </div>
                  </div>
                  <div class="room-interactive">
                    <div class="room-players">
                      <h4>Players</h4>
                      <ul>
                        <li v-for="player in tab.players" :key="player.id">
                          <span v-if="player.id === myPlayerId" style="color: #43cea2;">(You)</span>
                          {{ player.name }} <span v-if="player.isAdmin" style="color: #ffb347;">(ADMIN)</span>
                        </li>
                      </ul>
                    </div>
                    <div class="room-center">
                      <div class="room-ticket-info" v-if="tab.activeTicket">
                        <h4>Ticket: <span style="color:#43cea2">{{ tab.activeTicket.key }}</span></h4>
                        <div>{{ tab.activeTicket.summary }}</div>
                      </div>
                      <div class="room-ticket-info" v-else>
                        <h4>No active ticket - Ready for voting</h4>
                        <div>You can start voting even without assigning a ticket.</div>
                      </div>
                      <b-button
                        v-if="getIsAdmin(tab)"
                        variant="success"
                        size="lg"
                        class="start-vote-btn"
                        @click="startVote(tab)"
                      >
                        Start Vote
                      </b-button>
                      
                    </div>
                    <div class="room-right">
                    </div>
                  </div>
                   <button
                v-if="!tab.voting"
                class="room-action-btn"
                @click="closeTab(tab.id, tab.key, tab.type, getIsAdmin(tab))"
              >
                {{ getIsAdmin(tab) ? 'Close Room' : 'Leave Room' }}
              </button>
                </div>
              </transition>
            </b-card>
        </b-tab>
        <template #empty>
          <div class="text-center text-muted">
            There are no open tabs<br />
            Select a ticket from the sidebar or create a room to open a new tab.
          </div>
        </template>
      </b-tabs>
    </b-card>
    <DeleteRoomPopup
      v-if="showDeleteRoomPopup"
      :roomId="roomToDelete"
      @close="showDeleteRoomPopup = false"
    />
    <LeaveRoomPopup
      v-if="showLeaveRoomPopup"
      :roomId="roomToLeave"
      :playerId="myPlayerId"
      @close="showLeaveRoomPopup = false"
    />
  </div>
  <Notification v-model:show="showNotification" :message="notification" />
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useClipboard } from '@vueuse/core';
import DeleteRoomPopup from '../pop-ups/DeleteRoomPopup.vue';
import LeaveRoomPopup from '../pop-ups/LeaveRoomPopup.vue';
import { useWebSocket } from '../../websocket.js';
import Notification from '../pop-ups/Notification.vue';
import RoomVoting from './tab_type/RoomVoting.vue';

const { copy } = useClipboard();
const showDeleteRoomPopup = ref(false);
const showLeaveRoomPopup = ref(false);
const roomToLeave = ref(null);
const roomToDelete = ref(null);
const tabs = ref([]);
const notification = ref('');
const showNotification = ref(false);

const props = defineProps({
  ticketSelected: Object,
  newRoom: Object,
  username: String,
  myPlayerId: String,
});

const { addListener, removeListener, sendMessage } = useWebSocket();
defineExpose({ clearTabHistory });

function clearTabHistory() {
  tabs.value = [];
  localStorage.removeItem('tabs');
}

function getIsAdmin(tab) {
  if (!tab.players) return false;
  const me = tab.players.find(p => p.id === props.myPlayerId);
  return me ? me.isAdmin : false;
}

function showTempNotification(msg) {
  notification.value = msg;
  showNotification.value = true;
}

function closeTab(id, key, type, isAdmin) {
  if (type === "room") {
    if (isAdmin) {
      roomToDelete.value = id;
      showDeleteRoomPopup.value = true;
    } else {
      roomToLeave.value = id;
      showLeaveRoomPopup.value = true;
    }
  } else {
    tabs.value = tabs.value.filter(tab => tab.key !== key);
  }
}

function handleRoomClosed(message) {
  if (message.action === "roomClosed") {
    showTempNotification("Room was closed by the admin.");
    const roomTab = tabs.value.find(tab => tab.id === message.roomUUID);
    const isAdmin = roomTab && roomTab.players.find(p => p.id === props.myPlayerId && p.isAdmin);
    tabs.value = tabs.value.filter(tab => tab.id !== message.roomUUID);
    showDeleteRoomPopup.value = false;
    roomToDelete.value = null;
  }
}

function handlePlayerLeft(message) {
  if (message.action === "playerLeft") {
    const roomTab = tabs.value.find(tab => tab.id === message.roomUUID);
    if (message.leaverId === props.myPlayerId) {
      tabs.value = tabs.value.filter(tab => tab.id !== message.roomUUID);
      showLeaveRoomPopup.value = false;
      roomToLeave.value = null;
    } else if (roomTab) {
      roomTab.players = message.players;
      const leaver = message.playersLeft?.find?.(p => p.id === message.leaverId) ||
                     roomTab.players.find(p => p.id === message.leaverId);
      const leaverName = leaver ? leaver.name : "A player";
      showTempNotification(`${leaverName} has left the room.`);
    }
  }
}

function handlePlayerJoined(message) {
  if (message.action === 'playerJoined') {
    const roomTab = tabs.value.find(tab => tab.key === message.roomUUID);
    if (roomTab) {
      roomTab.players.push({
        id: message.player.uuid,
        name: message.player.name,
        isAdmin: message.player.isAdmin,
      });
    }
  }
}

function handleRoomJoined(message) {
  if (message.action === 'roomJoined') {
    let roomTab = tabs.value.find(tab => tab.key === message.room.key);
    const ticketKey = message.room.current_ticket;
    let ticket = null;
    if (ticketKey && props.tickets) {
      ticket = props.tickets.find(t => t.key === ticketKey);
    }
    if (!roomTab) {
        tabs.value = tabs.value.filter(tab => tab.type !== 'room');
      tabs.value.push({
        id: message.room.id,
        key: message.room.key,
        type: "room",
        name: message.room.name || "Unnamed Room",
        players: message.players.map(player => ({
          id: player.id,
          name: player.name,
          isAdmin: player.isAdmin,
        })),
        activeTicket: ticketKey ? (ticket || { key: ticketKey, summary: "Loading...", id: message.room.id }) : null,
      });
    } else {
      roomTab.players = message.players.map(player => ({
        id: player.id,
        name: player.name,
        isAdmin: player.isAdmin,
      }));
      if (ticketKey) {
        roomTab.activeTicket = ticket || { key: ticketKey, summary: "Loading...", id: message.room.id };
      }
    }
  }
}

function handleReturnToRoom(message) {
  const roomTab = tabs.value.find(tab => tab.id === message.roomUUID);
  if (roomTab) {
    roomTab.voting = false;
    roomTab.activeTicket = null; 
    showTempNotification("Returned to room view.");
  }
}
function handleTicketAssigned(message) {
  let roomTab = tabs.value.find(tab => tab.id === message.roomKey);
  if (!roomTab) {
    roomTab = tabs.value.find(tab => tab.key === message.roomKey);
  }
  if (roomTab) {
    const ticket = props.tickets?.find(t => t.key === message.ticketKey);
    if (ticket) {
      roomTab.activeTicket = { ...ticket, id: roomTab.id };
    } else {
      fetch(`https://agileplan-backend-production.up.railway.app/api/v1/tickets?key=${message.ticketKey}`)
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(ticketData => {
          roomTab.activeTicket = { ...ticketData, id: roomTab.id };
        })
        .catch(err => {
          showTempNotification("Failed to load ticket details.");
          roomTab.activeTicket = { key: message.ticketKey, summary: "Unavailable", id: roomTab.id };
        });
    }
  } else {
    console.warn("No matching tab found for ticketAssigned message", message);
  }
}

function onDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  event.target.closest('.room-card')?.classList.add('drag-over');
}

function startVote(tab) {
  sendMessage({
    action: 'start_vote',
    roomUUID: tab.id,
  });
}

function handleVoteStarted(message) {
  const roomTab = tabs.value.find(tab => tab.id === message.roomUUID);
  if (roomTab) {
    roomTab.voting = true;
  }
}

function onDrop(event) {
  event.preventDefault();
  const ticketData = event.dataTransfer.getData('ticket');
  if (!ticketData) return;
  const ticket = JSON.parse(ticketData);
  const roomUUID = event.target.closest('.room-card')?.dataset.id;
  if (!roomUUID) return;
  const roomTab = tabs.value.find(tab => tab.id === roomUUID);
  if (!roomTab) return;
  const me = roomTab.players.find(p => p.id === props.myPlayerId);
  if (!me || !me.isAdmin) {
    showTempNotification("Only the admin can assign a ticket.");
    return;
  }

  sendMessage({
    action: 'assign_ticket',
    roomUUID: roomTab.id, 
    ticketKey: ticket.key,
  });
  roomTab.activeTicket = ticket;
}

function organizeDescription(description) {
  if (typeof description !== "string") {
    return { "Description": ["No description available."] };
  }

  // Define your icons/keywords for sections in order
  const sectionIcons = [
    { key: "Description", icon: "📝" },
    { key: "Prerequisites", icon: "📋" },
    { key: "Task Description", icon: "📌" },
    { key: "Acceptance Criteria", icon: "✅" },
    { key: "Development Team Notes", icon: "🏗️" },
    { key: "Links and Dependencies", icon: "🔗" }
  ];

  // Build a regex to match any icon
  const iconRegex = new RegExp(`(${sectionIcons.map(s => s.icon).join('|')})`, 'g');

  // Split the description by icons, keeping the icons in the result
  const parts = description.split(iconRegex);

  let counter = 0;
  let sections = {};
  let buffer = [];

  // Always start with "Description"
  let currentSection = sectionIcons[0].key;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    const iconIndex = sectionIcons.findIndex(s => s.icon === part.trim());
    if (iconIndex !== -1) {
      // Save buffer to current section
      if (buffer.length) {
        if (!sections[currentSection]) sections[currentSection] = [];
        sections[currentSection] = sections[currentSection].concat(buffer.map(s => s.trim()).filter(Boolean));
        buffer = [];
      }
      // Increment counter and set new section
      counter++;
      if (counter < sectionIcons.length) {
        currentSection = sectionIcons[counter].key;
      } else {
        // If more icons than sections, just keep using the last section
        currentSection = sectionIcons[sectionIcons.length - 1].key;
      }
    } else {
      buffer.push(part);
    }
  }
  // Save any remaining buffer
  if (buffer.length) {
    if (!sections[currentSection]) sections[currentSection] = [];
    sections[currentSection] = sections[currentSection].concat(buffer.map(s => s.trim()).filter(Boolean));
  }

  return sections;
}

watch(
  () => props.ticketSelected,
  (newTicket) => {
    if (!newTicket || !newTicket.key) return;
    if (!tabs.value.some(tab => tab.key === newTicket.key)) {
      if (newTicket.description) {
        newTicket.description = organizeDescription(newTicket.description);
      }
      tabs.value.push({
        key: newTicket.key,
        type: "ticket",
        summary: newTicket.summary,
        description: newTicket.description,
      });
    }
  }
);

watch(
  tabs,
  (newTabs) => {
    localStorage.setItem('tabs', JSON.stringify(newTabs));
  },
  { deep: true }
);

watch(
  () => props.newRoom,
  (newRoom) => {
    if (!newRoom || !newRoom.key) return;
    if (!tabs.value.some(tab => tab.key === newRoom.key)) {
      const players = [
        {
          id: newRoom.player.id,
          name: newRoom.player.name,
          isAdmin: newRoom.player.isAdmin,
        },
      ];
      tabs.value.push({
        id: newRoom.id,
        key: newRoom.key,
        type: "room",
        name: newRoom.name || "Unnamed Room",
        players,
        activeTicket: null,
      });
    }
  }
);

onMounted(() => {
  addListener('playerJoined', handlePlayerJoined);
  addListener('roomJoined', handleRoomJoined);
  addListener('roomClosed', handleRoomClosed);
  addListener('playerLeft', handlePlayerLeft);
  addListener('ticketAssigned', handleTicketAssigned);
  addListener('voteStarted', handleVoteStarted);
  addListener('returnToRoom', handleReturnToRoom);
  addListener('roomHistoryUpdated', (msg) => {
    const tab = tabs.value.find(t => t.id === msg.roomUUID);
    if (tab) {
      tab.history = msg.history;
    }
  });
});

onUnmounted(() => {
  removeListener('playerJoined', handlePlayerJoined);
  removeListener('roomJoined', handleRoomJoined);
  removeListener('roomClosed', handleRoomClosed);
  removeListener('playerLeft', handlePlayerLeft);
  removeListener('ticketAssigned', handleTicketAssigned);
  removeListener('voteStarted', handleVoteStarted);
  removeListener('returnToRoom', handleReturnToRoom);
});
</script>


<style scoped>
.card {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background: transparent;
}

.b-tabs .nav-tabs {
  display: flex;
  flex-wrap: nowrap;         
  overflow-x: auto;          
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: #43cea2 #232526;
  position: sticky;
  min-height: 38px;
  max-height: 38px;
  border-bottom: 2px solid #43cea2;
}


.main-content {
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  background: rgba(24, 28, 34, 0.92);
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(31,38,135,0.18);
  animation: fadeIn 0.8s;
  min-height: 100%;
}


.tab-title {
  display: flex;
  align-items: center;
  color: #43cea2;
  font-weight: 600;
  letter-spacing: 1px;
  font-size: 1.08rem;
}
.close-button {
  opacity: 0;
  background-color: transparent;
  border: none;
  color: #43cea2;
  font-size: 1.2rem;
  line-height: 1;
  margin-left: 8px;
  padding: 0;
  cursor: pointer;
  transition: opacity 0.2s, color 0.2s;
}
.tab-title:hover .close-button {
  opacity: 1;
  color: #000000;
  background-color: transparent;
}

/* Notification styles */
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

.room-card-wrapper {
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  background: linear-gradient(135deg, #232526 0%, #181c22 100%);
  border-radius: 14px;
  box-shadow: 0 4px 24px rgba(67,198,172,0.10);
  padding: 18px 12px 18px 12px;
  animation: popIn 0.7s;
  position: relative;
}

/* Redesigned Room Layout */
.room-layout {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  min-height: 320px;
  animation: popIn 0.7s;
}

.room-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1.5px solid #43cea2;
  margin-bottom: 0.5rem;
}

.room-name {
  color: #fff;
  font-size: 1.15rem;
  font-weight: bold;
  text-align: left;
  text-shadow: 0 2px 8px #23252688;
}

.room-key {
  color: #43cea2;
  font-size: 0.95rem;
  margin-left: 12px;
  letter-spacing: 1px;
}

.room-interactive {
  display: flex;
  flex-direction: row;
  gap: 2.5rem;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  margin-top: 1rem;
}

.room-players {
  min-width: 160px;
  max-height: 220px;     
  overflow-y: auto;     
  background: rgba(67, 206, 162, 0.10);
  border-radius: 10px;
  padding: 16px 18px;
  color: #43cea2;
  font-size: 1.05rem;
  font-weight: 500;
  animation: popIn 0.8s;
  scrollbar-width: thin;
  scrollbar-color: #43cea2 #232526;
}

.room-players::-webkit-scrollbar {
  width: 7px;
  background: #232526;
}
.room-players::-webkit-scrollbar-thumb {
  background: #43cea2;
  border-radius: 8px;
}
.room-players::-webkit-scrollbar-track {
  background: #232526;
}

.room-players h4 {
  color: #fff;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.room-players ul {
  padding: 0;
  margin: 0;
  list-style: none;
}

.room-players li {
  margin-bottom: 0.4rem;
  color: #b5b5b5;
  font-size: 1em;
}

.room-players li span {
  color: #43cea2;
  font-weight: 600;
}

.room-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 1.2rem;
  background: rgba(35, 37, 38, 0.92);
  border-radius: 12px;
  padding: 18px 24px;
  box-shadow: 0 2px 12px #43cea222;
  min-width: 260px;
  max-width: 420px;
  margin: 0 1rem;
  animation: popIn 0.9s;
}

.room-ticket-info {
  color: #b5b5b5;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #43cea2;
  padding-bottom: 0.5rem;
  width: 100%;
  text-align: center;
}

.start-vote-btn {
  margin-top: 0.5rem;
  min-width: 180px;
  font-size: 1.15rem;
  background: linear-gradient(90deg, #43cea2 0%, #185a9d 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(67,198,172,0.12);
  transition: background 0.2s, box-shadow 0.2s;
  padding: 12px 0;
}
.start-vote-btn:hover {
  background: linear-gradient(90deg, #185a9d 0%, #43cea2 100%);
  box-shadow: 0 2px 8px #185a9daa;
}

.room-right {
  min-width: 120px;
  min-height: 120px;
}

.room-history-bar {
  top: 0;
  right: 0;
  height: 100%;
  background: rgba(35, 37, 38, 0.98);
  border-left: 2px solid #43cea2;
  z-index: 20;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  box-shadow: -2px 0 12px #43cea233;
  transition: width 0.3s cubic-bezier(.4,0,.2,1), background 0.3s;
}
.room-history-bar.open {
  width: 320px;
  min-width: 320px;
  max-width: 90vw;
}
.room-history-bar:not(.open) {
  width: 36px;
  min-width: 36px;
  max-width: 36px;
  background: #232526;
  box-shadow: none;
}
.history-toggle {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #232526;
  border-bottom: 1px solid #43cea2;
  font-size: 1.5rem;
  z-index: 21;
  color: #43cea2;
}
.history-content {
  position:absolute;
  padding: 8px;
  width: 284px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;  
  color: #b5b5b5;
  scrollbar-width: thin;
  scrollbar-color: #43cea2 #232526;
  z-index:2;
}

.history-content h5 {
  margin-top: 0;
  margin-bottom: 8px;
  align-self: flex-start;  
  color: #43cea2;
}

.history-item {
  margin-bottom: 16px;
  border-bottom: 1px solid #232526;
  padding-bottom: 8px;
}
.history-date {
  font-size: 0.9em;
  color: #888;
}
.history-votes span {
  display: inline-block;
  margin-right: 8px;
  font-size: 0.95em;
  color: #43cea2;
}

/* Animation for sliding */
.history-slide-enter-active,
.history-slide-leave-active {
  transition: transform 0.3s cubic-bezier(.9,0,.2,1), opacity 0.3s;
}
.history-slide-enter-from,
.history-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.room-history-toggle-collapsed {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 36px;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 2px solid #43cea2;
  border-radius: 0 4px 4px 0;
  z-index: 10;
  cursor: pointer;
  background: #232526;
}

.room-history-bar.open {
  width: 320px;
  min-width: 320px;
  max-width: 90vw;
  border-radius: 0 0 0 0;
}


.history-toggle-middle.history-close {
  /* shared styles */
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid #43cea2;
  background: #232526;
  font-size: 1.5rem;
  box-shadow: 0 2px 8px #43cea222;
  z-index: 22;
  color: #43cea2;
  transition: background 0.2s, color 0.2s, border-radius 0.2s;
}



.history-toggle-middle.history-close:hover {
  background: #43cea2;
  color: #232526;
}

.ticket-card {
  background: rgba(35, 37, 38, 0.98);
  color: #b5b5b5;
  border-radius: 12px;
  box-shadow: 0 2px 12px #43cea222;
  padding: 18px 16px;
  margin: 18px 0;
  animation: popIn 0.7s;
}

.description-section h5 {
  color: #43cea2;
  margin-bottom: 4px;
}


.text-center.text-muted {
  color: #fff;
  margin-top: 48px;
  font-size: 1.15rem;
  letter-spacing: 1px;
  animation: fadeIn 1s;

}

.room-key {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #43cea2;
  font-size: 1.05rem;
  margin-left: 12px;
  letter-spacing: 1px;
  user-select: none;
}

.copy-key-btn {
  margin-left: 0;
  background: none;
  color: #43cea2;
  border: none;
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 1em;
  cursor: pointer;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  box-shadow: none;
}
.copy-key-btn:hover {
  color: #ffb347;
}

.copy-key-btn svg {
  margin-right: 4px;
  vertical-align: middle;
  stroke: #43cea2;
  transition: stroke 0.2s;
}

.copy-key-btn:hover svg {
  stroke: #43cea2;
}

.copy-key-btn svg {
  margin-right: 4px;
  vertical-align: middle;
}
.copy-label {
  font-size: 0.98em;
  color: inherit;
  margin-left: 2px;
  letter-spacing: 0.5px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px);}
  to { opacity: 1; transform: translateY(0);}
}
@keyframes popIn {
  from { opacity: 0; transform: scale(0.95);}
  to { opacity: 1; transform: scale(1);}
}

.room-action-btn {
  position: absolute;
  bottom: 24px;
  right: 32px;
  background: #ff3b3b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 14px 24px;
  font-size: 1.12rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  z-index: 1;
}
.room-action-btn:hover {
  background: #ff3b3b;
  color: #111;
}
</style>