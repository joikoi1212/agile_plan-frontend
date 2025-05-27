<template>
  <div v-if="show" class="notification">
    <span class="icon">❗</span>
    <span>{{ message }}</span>
  </div>
</template>

<script setup>
import { watch } from 'vue';

const props = defineProps({
  message: String,
  show: Boolean,
});

const emit = defineEmits(['update:show']);

watch(() => props.show, (val) => {
  if (val) {
    setTimeout(() => {
      emit('update:show', false);
    }, 3000);
  }
});
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  color: #222;
  padding: 12px 24px;
  border-radius: 6px;
  border: 2px solid #222;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  z-index: 2000;
  opacity: 0.97;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
}
.icon {
  color: #e53935;
  font-size: 1.4em;
  margin-right: 8px;
}
</style>