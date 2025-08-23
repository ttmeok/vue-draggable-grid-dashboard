<template>
  <div class="dg-container">
    <!-- 调试信息 - 生产环境注释掉 -->
    <!-- <div class="dg-debug" style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.7); color: white; padding: 5px; font-size: 12px; z-index: 1000;">
      Grid: {{ gridWidth }}x{{ gridHeight }} | Items: {{ items.length }} | Container: {{ container?.offsetWidth }}x{{ container?.offsetHeight }}
    </div> -->
    
    <div class="dg-grid" :style="{ gap: gridGap + 'px' }">
      <!-- 背景网格 - 只在拖拽或调整大小时显示 -->
      <div
        v-for="n in gridXCount * gridYCount"
        :key="n"
        class="dg-cell"
        :class="{ 'dg-cell-visible': isDragging.state || isResizing.state }"
        :style="{
          flex: `0 0 ${gridWidth}px`,
          height: `${gridHeight}px`
        }"
      ></div>

      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="dg-item"
        :id="'dg_' + item.id"
        :style="{
          width: `${item.size.width * gridWidth + (item.size.width - 1) * gridGap}px`,
          height: `${item.size.height * gridHeight + (item.size.height - 1) * gridGap}px`,
          left: item.position.gridX * (gridWidth + gridGap) + 'px',
          top: item.position.gridY * (gridHeight + gridGap) + 'px',
          zIndex: isDragging.index === index || isResizing.index === index ? 3 : 2
        }"
        :class="{
          isResizing: isResizing.index === index,
          isDragging: isDragging.index === index
        }"
        @mousedown.stop="(event) => startDrag(event, item, index)"
      >
        <div class="dg-move-icon"></div>
        <div class="dg-resizer" @mousedown.stop="(event) => startResize(event, item, index)"></div>
        <div class="dg-card" @mousedown.stop>
          <slot name="card" :item="item" :index="index" />
        </div>
      </div>
    </div>

    <div class="dg-actions">
      <button class="dg-btn" @click="handleAdd">{{ addText }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

export interface GridItem {
  id: string | number
  size: { width: number; height: number }
  position: { gridX: number; gridY: number }
}

const props = defineProps({
  modelValue: { type: Array as () => GridItem[], required: true },
  gridXCount: { type: Number, default: 12 },
  gridYCount: { type: Number, default: 9 },
  gridGap: { type: Number, default: 10 },
  minWidth: { type: Number, default: 2 },
  minHeight: { type: Number, default: 2 },
  defaultSize: { type: Object as () => { width: number; height: number }, default: () => ({ width: 3, height: 3 }) },
  addText: { type: String, default: 'New Card' }
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: GridItem[]): void
  (e: 'add'): void
  (e: 'change', value: GridItem, index: number): void
  (e: 'delete', value: GridItem, index: number): void
}>()

const items = computed<GridItem[]>({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const gridWidth = ref<number>(50)
const gridHeight = ref<number>(50)
const gridXCount = computed(() => props.gridXCount)
const gridYCount = ref<number>(props.gridYCount)
const gridGap = computed(() => props.gridGap)

const container = ref<HTMLDivElement | null>(null)

const gridInit = () => {
  if (!container.value) return
  const containerWidth = container.value.offsetWidth - 32
  const containerHeight = container.value.offsetHeight - 32
  
  if (containerWidth <= 0 || containerHeight <= 0) {
    // 如果容器尺寸还没准备好，延迟重试
    setTimeout(gridInit, 100)
    return
  }
  
  // 计算网格尺寸，确保能容纳指定数量的网格
  const availableWidth = containerWidth - (gridXCount.value - 1) * gridGap.value
  const availableHeight = containerHeight - (gridYCount.value - 1) * gridGap.value
  
  gridWidth.value = Math.max(60, Math.floor(availableWidth / gridXCount.value))
  gridHeight.value = Math.max(60, Math.floor(availableHeight / gridYCount.value))

  // console.log('Grid initialized:', {
  //   containerWidth,
  //   containerHeight,
  //   gridWidth: gridWidth.value,
  //   gridHeight: gridHeight.value,
  //   gridXCount: gridXCount.value,
  //   gridYCount: gridYCount.value,
  //   availableWidth,
  //   availableHeight
  // })
}

const isDragging = ref<{ state: boolean; index: number | null }>({ state: false, index: null })
const isResizing = ref<{ state: boolean; index: number | null }>({ state: false, index: null })

const handleAdd = () => {
  emit('add')
}

// utils
const isPositionFree = (x: number, y: number, width: number, height: number, arr: GridItem[], current: GridItem) => {
  return !arr.some((item) => {
    if (item.id === current.id) return false
    return x < item.position.gridX + item.size.width && x + width > item.position.gridX && y < item.position.gridY + item.size.height && y + height > item.position.gridY
  })
}

const checkAndDealAll = () => {
  const list = items.value
    .map((item, index) => ({ ...item, index }))
    .sort((a, b) => a.position.gridY - b.position.gridY || a.position.gridX - b.position.gridX)
  const prev: any[] = []
  list.forEach((item: any) => {
    let targetX = item.position.gridX
    let targetY = item.position.gridY
    if (!isPositionFree(targetX, targetY, item.size.width, item.size.height, prev, item)) {
      while (!isPositionFree(targetX, targetY, item.size.width, item.size.height, prev, item)) {
        targetY += 1
      }
    } else {
      while (targetY > 0 && isPositionFree(targetX, targetY - 1, item.size.width, item.size.height, prev, item)) {
        targetY -= 1
      }
    }
    if (items.value[item.index].position.gridY !== targetY) {
      items.value[item.index].position.gridY = targetY
      if (targetY + item.size.height > gridYCount.value) {
        gridYCount.value = targetY + item.size.height
      }
      emit('change', items.value[item.index], item.index)
    }
    prev.push(item)
  })
}

// drag
const cloneElement = ref<any>(null)
const singleDragPosition = ref({ x: 0, y: 0 })
const startDrag = (event: MouseEvent, row: GridItem, index: number): void => {
  if (!container.value) return
  isDragging.value.state = true
  isDragging.value.index = index

  const dragElement = document.querySelector(`#dg_${row.id}`) as HTMLElement
  const dragBox = container.value.querySelector('.dg-grid') as HTMLElement
  cloneElement.value = dragElement.cloneNode(true) as HTMLElement
  cloneElement.value.classList.add('cloned')
  cloneElement.value.classList.remove('isDragging')
  singleDragPosition.value = { x: event.clientX - dragElement.offsetLeft, y: event.clientY - dragElement.offsetTop }
  dragBox.appendChild(cloneElement.value)
  cloneElement.value.style.left = `${dragElement.offsetLeft}px`
  cloneElement.value.style.top = `${dragElement.offsetTop}px`

  const dragHandler = (e: Event) => drag(e as MouseEvent, index)
  const stopDragHandler = () => stopDrag(dragHandler, stopDragHandler)
  document.addEventListener('mousemove', dragHandler)
  document.addEventListener('mouseup', stopDragHandler)
  event.preventDefault()
}

const checkAndDealEdge = (pos: { gridX: number; gridY: number }, item: GridItem) => {
  const maxX = gridXCount.value - item.size.width
  const maxY = gridYCount.value - item.size.height
  const newPosition = { ...pos }
  if (newPosition.gridX < 0) newPosition.gridX = 0
  else if (newPosition.gridX > maxX) newPosition.gridX = maxX
  if (newPosition.gridY < 0) newPosition.gridY = 0
  else if (newPosition.gridY > maxY) newPosition.gridY = maxY
  return newPosition
}

const isOverlappingPx = (pos: { x: number; y: number }, current: GridItem, other: GridItem): boolean => {
  const gridSizeFromEdge = (size: number, type: number, hasLastEdge?: boolean) => size * (type === 1 ? gridWidth.value : gridHeight.value) + (hasLastEdge ? size : size - 1) * gridGap.value
  return (
    pos.x < gridSizeFromEdge(other.position.gridX + other.size.width, 1) &&
    pos.x + gridSizeFromEdge(current.size.width, 1) > gridSizeFromEdge(other.position.gridX, 1, true) &&
    pos.y < gridSizeFromEdge(other.position.gridY + 1, 2) &&
    pos.y + gridHeight.value > gridSizeFromEdge(other.position.gridY, 2, true)
  )
}

const drag = (event: MouseEvent, index: number): void => {
  if (!isDragging.value.state) return
  event.preventDefault()
  const _left = event.clientX - singleDragPosition.value.x
  const _top = event.clientY - singleDragPosition.value.y
  cloneElement.value.style.left = `${_left}px`
  cloneElement.value.style.top = `${_top}px`
  const current = items.value[index]
  const newPosition = checkAndDealEdge({ gridX: Math.round(_left / (gridWidth.value + gridGap.value)), gridY: Math.floor(_top / (gridHeight.value + gridGap.value)) }, current)

  items.value.forEach((it, i) => {
    if (index !== i && isOverlappingPx({ x: _left, y: _top }, current, it)) {
      it.position = { gridX: it.position.gridX, gridY: it.position.gridY + 1 }
    }
  })
  current.position = newPosition
  checkAndDealAll()
}

const stopDrag = (dragHandler: EventListener, stopDragHandler: EventListener): void => {
  isDragging.value.state = false
  isDragging.value.index = null
  const grid = container.value!.querySelector('.dg-grid') as HTMLElement
  grid.removeChild(cloneElement.value)
  cloneElement.value = null
  document.removeEventListener('mousemove', dragHandler)
  document.removeEventListener('mouseup', stopDragHandler)
}

// resize
const startResize = (event: MouseEvent, row: GridItem, index: number): void => {
  isResizing.value.state = true
  isResizing.value.index = index
  const startX = event.clientX
  const startY = event.clientY
  const startWidth = items.value[index].size.width
  const startHeight = items.value[index].size.height
  const resizeHandler = (e: Event) =>
    resize(e as MouseEvent, index, startWidth, startHeight, startX, startY)
  const stopResizeHandler = () => stopResize(resizeHandler, stopResizeHandler)
  document.addEventListener('mousemove', resizeHandler)
  document.addEventListener('mouseup', stopResizeHandler)
}

const checkAndDealSize = (size: { width: number; height: number }, item: GridItem) => {
  const maxWidth = gridXCount.value - item.position.gridX
  const maxHeight = gridYCount.value - item.position.gridY
  const newSize = { ...size }
  if (newSize.width > maxWidth) newSize.width = maxWidth
  if (newSize.height > maxHeight) gridYCount.value = item.position.gridY + newSize.height
  if (newSize.width < props.minWidth) newSize.width = props.minWidth
  if (newSize.height < props.minHeight) newSize.height = props.minHeight
  return newSize
}

const resize = (
  event: MouseEvent,
  index: number,
  startWidth: number,
  startHeight: number,
  startX: number,
  startY: number
): void => {
  if (!isResizing.value.state) return
  event.preventDefault()
  const deltaX = event.clientX - startX
  const deltaY = event.clientY - startY
  const newWidth = Math.max(props.minWidth, startWidth + Math.round(deltaX / (gridWidth.value + gridGap.value)))
  const newHeight = Math.max(props.minHeight, startHeight + Math.round(deltaY / (gridHeight.value + gridGap.value)))
  const current = items.value[index]
  current.size = checkAndDealSize({ width: newWidth, height: newHeight }, current)
  checkAndDealAll()
}

const stopResize = (resizeHandler: EventListener, stopResizeHandler: EventListener): void => {
  isResizing.value.state = false
  isResizing.value.index = null
  document.removeEventListener('mousemove', resizeHandler)
  document.removeEventListener('mouseup', stopResizeHandler)
}

const resizeFn = () => gridInit()

onMounted(() => {
  container.value = document.querySelector('.dg-container') as HTMLDivElement
  if (container.value) {
    nextTick(() => {
      gridInit()
      window.addEventListener('resize', resizeFn)
    })
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeFn)
})
</script>

<style scoped>
.dg-container {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 600px;
  padding: 16px;
  box-sizing: border-box;
  background-color: #f5f5f5;
}
.dg-grid {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  min-height: 100%;
  box-sizing: border-box;
  overflow: visible;
  gap: 10px;
}
.dg-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 2px dashed #e8e8e8;
  background-color: transparent;
  box-sizing: border-box;
  flex-shrink: 0;
  min-width: 50px;
  min-height: 50px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.dg-cell-visible {
  opacity: 1;
  background-color: #f8f9fa;
}

.dg-item {
  position: absolute;
  background-color: #fff;
  border: 3px solid #fff;
  border-radius: 12px;
  user-select: none;
  padding: 12px;
  box-sizing: border-box;
  transition: top 0.2s, left 0.2s, width 0.2s, height 0.2s, border 0.5s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.dg-item .dg-resizer {
  display: none;
  position: absolute;
  right: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  background-color: #46b9b9;
  border-radius: 50%;
  border: 3px solid #ffffff;
  transform: translateX(50%) translateY(50%);
  cursor: se-resize;
  z-index: 5;
}
.dg-item .dg-move-icon {
  display: none;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  cursor: move;
  z-index: 2;
}
.dg-item.cloned { transition: none; pointer-events: none; z-index: 1000 !important; }
.dg-item.isDragging { border-color: rgba(0,0,0,0.1) !important; background-color: rgba(0,0,0,0.1); }
.dg-item.isDragging * { visibility: hidden; }
.dg-item:hover:not(.isDragging), .dg-item.isResizing { border-color: #46b9b9; }
.dg-item:hover:not(.isDragging) .dg-resizer, .dg-item.isResizing .dg-resizer { display: block; }
.dg-card { width: 100%; height: 100%; }
.dg-actions { position: absolute; bottom: 12px; left: 16px; }
.dg-btn { padding: 6px 10px; border-radius: 6px; border: 1px solid #46b9b9; color: #46b9b9; background: #fff; cursor: pointer; }
.dg-btn:hover { background: #e8f6f6; }
</style>


