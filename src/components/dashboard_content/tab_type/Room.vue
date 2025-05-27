<template>
    <b-card class="room-card" :data-key="room.key" @drop="onDrop" @dragover.prevent="onDragOver">
      <div class="room-header">
        <h3>Room: {{ room.name }}</h3>
        <p class="room-key">
          Room Key: <b style="display: none;">{{ room.key }}</b>
          <b-button size="sm" @click="copy(room.key)">Copy</b-button>
        </p>
      </div>
      <div class="room-players-tickets">
        <div class="room-players">
          <h4>Players:</h4>
          <ul>
            <li v-for="player in room.players" :key="player.id">
              <span v-if="player.id === currentUserId" style="color: blue;">(You)</span>
              {{ player.name }} <span v-if="player.isAdmin">(ADMIN)</span>
            </li>
          </ul>
        </div>
        <div class="room-ticket">
          <h4>Ticket:</h4>
          <div v-if="room.activeTicket">
            <p><strong>{{ room.activeTicket.key }}</strong> - {{ room.activeTicket.summary }}</p>
          </div>
          <div v-else>
            <p>No ticket. Assign one by dragging from the sidebar.</p>
          </div>
        </div>
      </div>
    </b-card>
  </template>
  
  <script setup>

  import { useClipboard } from '@vueuse/core';
  
  const props = defineProps({
    room: {
      type: Object,
      required: true,
    },
    currentUserId: {
      type: String,
      required: true,
    },
  });
  
  const emit = defineEmits(['updateRoom']);
  
  const { copy } = useClipboard();
  
  const onDragOver = (event) => {
    console.log('onDragOver triggered');
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move'; // Allow the drop event to occur
    event.target.closest('.room-card')?.classList.add('drag-over');
  };
  
  const onDrop = (event) => {
    console.log('onDrop triggered');
    event.preventDefault();
    event.target.closest('.room-card')?.classList.remove('drag-over');
  
    const ticketData = event.dataTransfer.getData('ticket');
    if (!ticketData) {
      console.error('No ticket data found in drag event.');
      return;
    }
  
    const ticket = JSON.parse(ticketData);
    console.log('Dropped ticket:', ticket);
  
    emit('updateRoom', { roomKey: room.key, ticket });
  };
  </script>
  
  <style scoped>
  .room-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .room-key {
    font-size: 0.9rem;
    color: gray;
  }
  
  .room-players-tickets {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 1rem;
  }
  
  .room-players {
    flex: 1;
    margin-right: 1rem;
  }
  
  .room-players ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  
  .room-players li {
    margin-bottom: 0.5rem;
  }
  
  .room-ticket {
    flex: 2;
    text-align: left;
  }
  
  .room-ticket p {
    margin: 0;
    color: gray;
  }
  </style>