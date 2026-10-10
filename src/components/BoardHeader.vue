<script setup>
defineProps({
  priorityFilter: { type: String, required: true },
  search: { type: String, required: true },
  theme: { type: String, required: true },
  totalTasks: { type: Number, default: 0 },
})

const emit = defineEmits(['toggle-theme', 'update-priority', 'update-search'])
</script>

<template>
  <header class="board-header">
    <div class="board-header__top">
      <div class="brand">
        <div class="brand__mark">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M9 3v18" />
            <path d="M15 3v18" />
          </svg>
        </div>
        <div class="brand__info">
          <div class="brand__title-row">
            <strong>Kanban Board</strong>
            <span class="brand__badge">v2.0</span>
          </div>
          <small class="brand__subtitle">Flow planning system</small>
        </div>
      </div>

      <div class="board-header__actions">
        <div v-if="totalTasks > 0" class="board-header__task-count">
          <span class="count-dot"></span>
          <span>{{ totalTasks }} {{ totalTasks === 1 ? 'tarea' : 'tareas' }}</span>
        </div>

        <button
          type="button"
          class="theme-toggle-btn"
          :title="theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          :aria-label="theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
          @click="emit('toggle-theme')"
        >
          <!-- Moon Icon (when in dark mode, clicking switches to light) -->
          <svg v-if="theme === 'dark'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <!-- Sun Icon (when in light mode, clicking switches to dark) -->
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <span class="theme-label">{{ theme === 'dark' ? 'Dark' : 'Light' }}</span>
        </button>
      </div>
    </div>

    <div class="board-header__controls">
      <div class="search-box">
        <svg class="search-box__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          :value="search"
          type="search"
          placeholder="Buscar tareas o responsables..."
          aria-label="Buscar tareas"
          @input="emit('update-search', $event.target.value)"
        />
        <button
          v-if="search"
          type="button"
          class="search-box__clear"
          aria-label="Limpiar búsqueda"
          @click="emit('update-search', '')"
        >
          &times;
        </button>
      </div>

      <div class="filter-box">
        <select
          :value="priorityFilter"
          aria-label="Filtrar por prioridad"
          @change="emit('update-priority', $event.target.value)"
        >
          <option value="all">Todas las prioridades</option>
          <option value="high">Alta (High)</option>
          <option value="medium">Media (Medium)</option>
          <option value="low">Baja (Low)</option>
        </select>
      </div>
    </div>
  </header>
</template>