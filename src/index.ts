import type { App } from 'vue'
import DraggableGrid from './lib/DraggableGrid.vue'

export { DraggableGrid }

export default {
  install(app: App) {
    app.component('DraggableGrid', DraggableGrid)
  }
}

export * from './lib/types'


