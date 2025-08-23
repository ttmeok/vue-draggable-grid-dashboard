# 🚀 Vue Draggable Grid Dashboard

一个功能强大的 Vue 3 拖拽网格仪表板组件，支持拖拽、缩放、添加、删除等功能。

**[🚀 在线演示页面](https://ttmeok.github.io/vue-draggable-grid-dashboard)**

## ✨ 特性

- 🖱️ **拖拽功能** - 支持拖拽卡片改变位置
- 📏 **缩放功能** - 支持拖拽右下角调整卡片尺寸
- ➕ **添加卡片** - 一键添加新卡片到网格
- 🗑️ **删除卡片** - 支持删除指定卡片
- 🎯 **智能布局** - 自动检测碰撞并优化布局
- 🎨 **自定义样式** - 支持通过插槽自定义卡片内容
- 📱 **响应式设计** - 支持不同屏幕尺寸
- 🔧 **TypeScript** - 完整的类型支持
- ⚡ **Vue 3** - 基于最新的 Vue 3 Composition API

## 📦 安装

```bash
npm install vue-draggable-grid-dashboard
# 或
yarn add vue-draggable-grid-dashboard
# 或
pnpm add vue-draggable-grid-dashboard
```

## 🚀 快速开始

### 1. 导入组件和样式

```typescript
import { DraggableGrid } from 'vue-draggable-grid-dashboard'
import 'vue-draggable-grid-dashboard/dist/vue-draggable-grid-dashboard.css'
```

### 2. 基本使用

```vue
<template>
  <DraggableGrid
    v-model="items"
    :grid-x-count="12"
    :grid-y-count="9"
    :grid-gap="10"
    @add="onAdd"
    @change="onChange"
  >
    <template #card="{ item, index }">
      <div class="card">
        <h3>卡片 {{ index + 1 }}</h3>
        <p>ID: {{ item.id }}</p>
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
  { id: '2', size: { width: 3, height: 2 }, position: { gridX: 3, gridY: 0 } },
])

const onAdd = () => {
  const id = Math.random().toString(36).slice(2, 8)
  items.value.push({
    id,
    size: { width: 3, height: 3 },
    position: { gridX: 6, gridY: 0 },
  })
}

const onChange = (item: GridItem, index: number) => {
  console.log('卡片变化:', item, index)
}
</script>
```

## 📚 API 文档

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `GridItem[]` | `[]` | 网格项目数据（v-model） |
| `gridXCount` | `number` | `12` | 网格X轴数量 |
| `gridYCount` | `number` | `9` | 网格Y轴数量 |
| `gridGap` | `number` | `10` | 网格间距（像素） |
| `minWidth` | `number` | `2` | 最小宽度（网格单位） |
| `minHeight` | `number` | `2` | 最小高度（网格单位） |
| `defaultSize` | `object` | `{ width: 3, height: 3 }` | 新卡片的默认尺寸 |
| `addText` | `string` | `"New Card"` | 添加按钮的文本 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update:modelValue` | `GridItem[]` | 数据更新时触发 |
| `add` | - | 点击添加按钮时触发 |
| `change` | `item: GridItem, index: number` | 卡片位置或尺寸变化时触发 |
| `delete` | `index: number` | 删除卡片时触发 |

### Slots

| 插槽名 | 参数 | 说明 |
|--------|------|------|
| `card` | `{ item: GridItem, index: number }` | 卡片内容插槽 |

### Types

```typescript
interface GridItem {
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

## 🎯 高级用法

### 自定义卡片样式

```vue
<template #card="{ item, index }">
  <div class="custom-card" :class="getCardClass(item)">
    <div class="card-header">
      <span class="card-icon">{{ getCardIcon(item.type) }}</span>
      <span class="card-title">{{ item.title }}</span>
      <button @click="deleteCard(index)" class="delete-btn">🗑️</button>
    </div>
    <div class="card-content">
      <slot name="card-content" :item="item" :index="index" />
    </div>
  </div>
</template>
```

### 智能布局算法

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

### 响应式网格

```vue
<DraggableGrid
  v-model="items"
  :grid-x-count="isMobile ? 6 : 12"
  :grid-y-count="isMobile ? 6 : 9"
  :grid-gap="isMobile ? 5 : 10"
  :min-width="isMobile ? 2 : 3"
  :min-height="isMobile ? 2 : 3"
>
  <!-- 卡片内容 -->
</DraggableGrid>
```

## 🔧 开发指南

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/ttmeok/vue-draggable-grid-dashboard.git
cd vue-draggable-grid-dashboard

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建库
npm run build

# 构建演示页面
npm run build:demo
```

### 项目结构

```
vue-draggable-grid-dashboard/
├── src/
│   ├── lib/
│   │   ├── DraggableGrid.vue    # 主组件
│   │   └── types.ts             # 类型定义
│   ├── App.vue                  # 演示应用
│   └── index.ts                 # 入口文件
├── dist/                        # 构建输出
├── docs/                        # GitHub Pages 演示
└── package.json
```

## 📈 更新日志

### v1.0.2 (2024-08-24)
- ✨ 添加完整的 TypeScript 类型声明
- 🐛 修复 CSS 导出配置问题
- 📦 优化 npm 包结构

### v1.0.1 (2024-08-24)
- 🐛 修复 CSS 文件导入路径问题
- 📝 更新 package.json 配置

### v1.0.0 (2024-08-24)
- 🎉 首次发布
- ✨ 实现拖拽、缩放、添加、删除功能
- 🎨 支持自定义卡片内容
- 📱 响应式网格布局

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

**⭐ 如果这个项目对你有帮助，请给它一个星标！**
