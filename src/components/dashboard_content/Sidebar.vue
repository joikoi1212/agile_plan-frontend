<template>
  <div class="sidebar-body">
    <aside>
      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search tickets..."
          class="search-input"
        />
      </div>
      <ul class="list">
        <li
          v-for="ticket in filteredTickets"
          :key="ticket.key"
          class="ticket-item"
          draggable="true"
          @dragstart="(event) => onDragStart(ticket, event)"
          @mouseover="handleMouseOver(ticket, $event)"
          @mousemove="handleMouseMove"
          @mouseleave="handleMouseLeave"
          @click="mouseSelect(ticket)"
        >
          <p>{{ ticket.key }}</p>
        </li>
      </ul>
      <div
        v-if="hoveredTicket"
        class="ticket-info-box"
        :style="{ top: `${mousePosition.y}px`, left: `${mousePosition.x + 10}px` }"
      >
        <h3>{{ hoveredTicket.key }}</h3>
        <p>{{ hoveredTicket.summary }}</p>
        <p>Status: {{ hoveredTicket.status.name }}</p>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const tickets = defineProps({
  tickets: {
    type: Array,
    default: () => [],
  },
});

const hoveredTicket = ref(null);
const mousePosition = ref({ x: 0, y: 0 });
const searchQuery = ref('');

const emit = defineEmits(['ticket-selected']);

const filteredTickets = computed(() => {
  return tickets.tickets.filter((ticket) =>
    ticket.key.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const handleMouseOver = (ticket, event) => {
  hoveredTicket.value = ticket;
  adjustHoverBoxPosition(event);
};

const handleMouseMove = (event) => {
  adjustHoverBoxPosition(event);
};

const adjustHoverBoxPosition = (event) => {
  const hoverBoxWidth = 200;
  const hoverBoxHeight = 200;
  const padding = 24;

  let x = event.clientX + 24;
  let y = event.clientY;

  if (x + hoverBoxWidth > window.innerWidth) {
    x = window.innerWidth - hoverBoxWidth - padding;
  }
  if (y + hoverBoxHeight > window.innerHeight) {
    y = window.innerHeight - hoverBoxHeight - padding;
  }

  mousePosition.value = { x, y };
};

const handleMouseLeave = () => {
  hoveredTicket.value = null;
};

const mouseSelect = (ticket) => {
  emit('ticket-selected', ticket);
  console.log("clicked ticket: ", ticket.key);
}

const onDragStart = (ticket, $event) => {
  $event.dataTransfer.setData('ticket', JSON.stringify(ticket));
  hoveredTicket.value = null; 
  console.log('Dragging ticket:', ticket.key);
};
</script>

<style scoped>

.sidebar-body {
  height: 100%;
  width: 220px;
  min-width: 140px;
  max-width: 340px;
  resize: horizontal;          
  overflow: auto;
  background: linear-gradient(135deg, #232526 0%, #181c22 100%);
  border-right: 2px solid #43cea2;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px #43cea222;
  position: relative;
  min-width: 0;
}

aside {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.search-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: linear-gradient(135deg, #232526 0%, #181c22 100%);
  padding: 1rem 1rem 0.5rem 1rem;
  border-bottom: 2px solid #43cea2;
}

.search-input {
  width: 100%;
  padding: 0.6rem 1rem;
  border: 1.5px solid #43cea2;
  border-radius: 8px;
  font-size: 1rem;
  background: #232526;
  color: #43cea2;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 4px #43cea233;
}
.search-input:focus {
  border: 1.5px solid #ffb347;
  box-shadow: 0 2px 8px #ffb34744;
  color: #ffb347;
}

.list {
  list-style-type: none;
  margin: 0;
  padding: 0.5rem 0.5rem 1rem 0.5rem;
  overflow-y: auto;
  flex: 1 1 auto;
  max-height: calc(100vh - 80px);
  scrollbar-width: thin;
  scrollbar-color: #43cea2 #232526;
}

/* Custom scrollbar for Webkit browsers */
.list::-webkit-scrollbar {
  width: 7px;
  background: #232526;
}
.list::-webkit-scrollbar-thumb {
  background: #000000;
  border-radius: 8px;
}
.list::-webkit-scrollbar-track {
  background: #232526;
}

.ticket-item {
  margin-bottom: 0.5rem;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  cursor: grab;
  transition: background 0.2s, color 0.2s;
  color: #ffffff;
  font-weight: 600;
  font-size: 1.08rem;
  background: none;
  border: 1.5px solid transparent;
  box-shadow: none;
  letter-spacing: 1px;
}
.ticket-item:active {
  cursor: grabbing;
}
.ticket-item:hover {
  background: linear-gradient(90deg, #43cea2 0%, #185a9d 100%);
  color: #fff;
  border: 1.5px solid #43cea2;
  box-shadow: 0 2px 8px #43cea244;
}

.ticket-info-box {
  position: fixed;
  background: linear-gradient(135deg, #232526 0%, #43cea2 100%);
  color: #fff;
  padding: 1rem 1.2rem;
  border: 2px solid #43cea2;
  border-radius: 12px;
  box-shadow: 0 4px 16px #43cea244;
  z-index: 1000;
  width: 220px;
  min-height: 120px;
  max-width: 90vw;
  pointer-events: none;
  font-size: 1rem;
  animation: popIn 0.3s;
}
.ticket-info-box h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 1px;
}
.ticket-info-box p {
  margin: 0 0 0.3rem 0;
  color: #fff;
  font-size: 0.98rem;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.95);}
  to { opacity: 1; transform: scale(1);}
}
</style>