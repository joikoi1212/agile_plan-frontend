import { ref } from 'vue';

const ws = ref(null);
const isConnected = ref(false);
const listeners = ref({});

export function useWebSocket() {
  const connect = () => {
    if (ws.value) return;

    ws.value = new WebSocket('ws://localhost:8088/ws');

    ws.value.onopen = () => {
      console.log('WebSocket connected');
      isConnected.value = true;
    };

    ws.value.onclose = () => {
      console.log('WebSocket disconnected');
      isConnected.value = false;
    };

    ws.value.onerror = (error) => {
      console.error('WebSocket error:', error);
      isConnected.value = false;
    };

    ws.value.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('WebSocket message received:', message);

      // Notify all listeners for the specific action
      if (message.action && listeners.value[message.action]) {
        listeners.value[message.action].forEach((callback) => callback(message));
      }
    };
  };

  const sendMessage = (message) => {
    if (ws.value && isConnected.value) {
      ws.value.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  };

  const addListener = (action, callback) => {
    if (!listeners.value[action]) {
      listeners.value[action] = [];
    }
    listeners.value[action].push(callback);
  };

  const removeListener = (action, callback) => {
    if (listeners.value[action]) {
      listeners.value[action] = listeners.value[action].filter((cb) => cb !== callback);
    }
  };

  return {
    connect,
    sendMessage,
    addListener,
    removeListener,
    isConnected,
  };
}