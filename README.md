# vue-draggable-grid-dashboard

一个功能强大的 Vue 3 拖拽网格仪表板组件，支持卡片拖拽、缩放、新建、删除等功能，完美适用于数据可视化仪表板、项目管理面板等场景。

## ✨ 特性

- 🖱️ **拖拽功能**：支持卡片拖拽改变位置
- 📏 **缩放功能**：支持拖拽右下角调整卡片尺寸
- ➕ **新建卡片**：支持动态添加新卡片
- 🗑️ **删除卡片**：支持删除指定卡片
- 🎨 **自定义内容**：通过 slot 完全自定义卡片内容
- 📱 **响应式设计**：支持不同屏幕尺寸
- 🎯 **网格对齐**：自动对齐到网格系统
- 🚀 **Vue 3 + TypeScript**：现代化技术栈

## 📦 安装

```bash
npm install vue-draggable-grid-dashboard
```

## 🚀 基础用法

```vue
<template>
  <DraggableGrid 
    v-model="items" 
    :grid-x-count="12" 
    :grid-y-count="9"
    @add="onAdd"
    @change="onChange"
  >
    <template #card="{ item, index }">
      <div class="card">
        <h3>卡片 {{ index + 1 }}</h3>
        <p>内容: {{ item.id }}</p>
        <p>尺寸: {{ item.size.width }}×{{ item.size.height }}</p>
        <p>位置: {{ item.position.gridX }}, {{ item.position.gridY }}</p>
      </div>
    </template>
  </DraggableGrid>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DraggableGrid } from 'vue-draggable-grid-dashboard'
import type { GridItem } from 'vue-draggable-grid-dashboard'

const items = ref<GridItem[]>([
  { id: '1', size: { width: 3, height: 3 }, position: { gridX: 0, gridY: 0 } },
  { id: '2', size: { width: 3, height: 2 }, position: { gridX: 3, gridY: 0 } }
])

const onAdd = () => {
  const id = Math.random().toString(36).slice(2, 8)
  items.value.push({ 
    id, 
    size: { width: 3, height: 3 }, 
    position: { gridX: 0, gridY: 0 } 
  })
}

const onChange = (item: GridItem, index: number) => {
  console.log('卡片变化:', item, index)
}
</script>
```

## 🎯 高级用法

### 1. 自定义卡片类型

```vue
<template>
  <DraggableGrid v-model="items" :grid-x-count="12" :grid-y-count="9">
    <template #card="{ item, index }">
      <div class="card" :class="getCardType(item.id)">
        <div class="card-header">
          <span class="icon">{{ getCardIcon(item.id) }}</span>
          <h3>{{ getCardTitle(item.id) }}</h3>
          <button @click="removeCard(index)">删除</button>
        </div>
        <div class="card-content">
          {{ getCardContent(item.id) }}
        </div>
        <div class="card-footer">
          <span>{{ item.size.width }}×{{ item.size.height }}</span>
          <span>{{ item.position.gridX }}, {{ item.position.gridY }}</span>
        </div>
      </div>
    </template>
  </DraggableGrid>
</template>
```

### 2. 智能位置计算

```typescript
const onAdd = () => {
  const id = Math.random().toString(36).slice(2, 8)
  
  // 找到第一个可用的位置
  let gridX = 0
  let gridY = 0
  let found = false
  
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 12; x++) {
      const canPlace = !items.value.some(item => 
        x < item.position.gridX + item.size.width && 
        x + 3 > item.position.gridX && 
        y < item.position.gridY + item.size.height && 
        y + 3 > item.position.gridY
      )
      
      if (canPlace) {
        gridX = x
        gridY = y
        found = true
        break
      }
    }
    if (found) break
  }
  
  items.value.push({ 
    id, 
    size: { width: 3, height: 3 }, 
    position: { gridX, gridY } 
  })
}
```

### 3. 实时统计信息

```vue
<template>
  <div class="dashboard">
    <div class="toolbar">
      <div class="stats">
        <span>📊 卡片: {{ stats.totalCards }}</span>
        <span>🔲 网格: {{ stats.totalGrids }}</span>
        <span>📈 图表: {{ stats.types.chart || 0 }}</span>
      </div>
    </div>
    
    <DraggableGrid v-model="items">
      <!-- 卡片内容 -->
    </DraggableGrid>
  </div>
</template>

<script setup>
const stats = computed(() => ({
  totalCards: items.value.length,
  totalGrids: items.value.reduce((sum, item) => sum + item.size.width * item.size.height, 0),
  types: cardData.value.reduce((acc, card) => {
    acc[card.type] = (acc[card.type] || 0) + 1
    return acc
  }, {})
}))
</script>
```

## 📋 Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `GridItem[]` | `[]` | 网格项目数组（v-model） |
| `gridXCount` | `number` | `12` | 网格X轴数量 |
| `gridYCount` | `number` | `9` | 网格Y轴数量 |
| `gridGap` | `number` | `10` | 网格间距（像素） |

## 📡 Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update:modelValue` | `(items: GridItem[])` | 项目变化时触发 |
| `add` | `() => void` | 新建卡片时触发 |
| `change` | `(item: GridItem, index: number)` | 卡片变化时触发 |

## 🎨 Slots

| 插槽名 | 参数 | 说明 |
|--------|------|------|
| `card` | `{ item: GridItem, index: number }` | 自定义卡片内容 |

## 📊 类型定义

```typescript
export interface GridItem {
  id: string | number
  size: { 
    width: number
    height: number 
  }
  position: { 
    gridX: number
    gridY: number 
  }
}
```

## 🎯 使用场景

### 1. 数据可视化仪表板
- 拖拽调整图表位置和大小
- 动态添加新的数据图表
- 自定义图表类型和样式

### 2. 项目管理面板
- 拖拽任务卡片到不同状态列
- 调整任务卡片优先级显示
- 添加新的任务或项目

### 3. 内容管理系统
- 拖拽内容块调整布局
- 响应式内容网格
- 动态内容组件

### 4. 个人工作台
- 自定义工作区域布局
- 拖拽工具和组件
- 个性化界面配置

## 🔧 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建库
npm run build

# 类型检查
npm run type:build
```

## 📝 更新日志

### v1.0.0
- ✨ 初始版本发布
- 🖱️ 支持卡片拖拽功能
- 📏 支持卡片缩放功能
- ➕ 支持新建和删除卡片
- 🎨 支持自定义卡片内容
- 📱 响应式网格布局

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## �� 许可证

MIT License
