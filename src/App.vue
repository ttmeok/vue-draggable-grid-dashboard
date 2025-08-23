<script setup lang="ts">
import { ref, computed } from 'vue'
import { DraggableGrid } from './index'
import type { GridItem } from './lib/types'

// 模拟不同类型的卡片数据
interface CardData {
  id: string
  type: 'chart' | 'table' | 'metric' | 'image'
  title: string
  content: string
  color: string
  icon: string
}

const cardData = ref<CardData[]>([
  { id: '1', type: 'chart', title: '销售趋势图', content: '月度销售数据可视化', color: '#46B9B9', icon: '📊' },
  { id: '2', type: 'table', title: '用户列表', content: '用户信息数据表格', color: '#9D74F0', icon: '📋' },
  { id: '3', type: 'metric', title: '转化率', content: '当前转化率: 23.5%', color: '#F7905B', icon: '📈' },
  { id: '4', type: 'image', title: '产品展示', content: '产品图片展示区域', color: '#8FA5F9', icon: '🖼️' }
])

// 网格项目数据
const items = ref<GridItem[]>([
  { id: '1', size: { width: 4, height: 3 }, position: { gridX: 0, gridY: 0 } },
  { id: '2', size: { width: 3, height: 2 }, position: { gridX: 4, gridY: 0 } },
  { id: '3', size: { width: 2, height: 2 }, position: { gridX: 7, gridY: 0 } },
  { id: '4', size: { width: 3, height: 3 }, position: { gridX: 9, gridY: 0 } }
])

// 计算属性：根据items获取对应的卡片数据
const getCardData = (itemId: string | number) => {
  return cardData.value.find(card => card.id === String(itemId))
}

// 新建卡片
const onAdd = () => {
  const id = Math.random().toString(36).slice(2, 8)
  
  // 找到第一个可用的位置
  let gridX = 0
  let gridY = 0
  let found = false
  
  // 简单的网格扫描算法
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 12; x++) {
      // 检查这个位置是否有足够的空间
      const canPlace = !items.value.some((item: GridItem) => 
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
  
  // 随机选择卡片类型
  const types = ['chart', 'table', 'metric', 'image']
  const randomType = types[Math.floor(Math.random() * types.length)]
  const colors = ['#46B9B9', '#9D74F0', '#F7905B', '#8FA5F9', '#A4B059', '#E08DCD']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  const icons = ['📊', '📋', '📈', '🖼️', '🔧', '💡']
  const randomIcon = icons[Math.floor(Math.random() * icons.length)]
  
  // 添加新卡片数据
  cardData.value.push({
    id,
    type: randomType as any,
    title: `新卡片 ${cardData.value.length + 1}`,
    content: `这是一个${randomType}类型的卡片`,
    color: randomColor,
    icon: randomIcon
  })
  
  // 添加网格项目
  items.value.push({ 
    id, 
    size: { width: 3, height: 3 }, 
    position: { gridX, gridY } 
  })
}

// 删除卡片
const remove = (item: GridItem, index: number) => {
  // 从卡片数据中删除
  const cardIndex = cardData.value.findIndex(card => card.id === item.id)
  if (cardIndex > -1) {
    cardData.value.splice(cardIndex, 1)
  }
  
  // 从网格项目中删除
  items.value.splice(index, 1)
}

// 编辑卡片标题
const editTitle = (itemId: string | number) => {
  const card = cardData.value.find(c => c.id === String(itemId))
  if (card) {
    const newTitle = prompt('请输入新标题:', card.title)
    if (newTitle && newTitle.trim()) {
      card.title = newTitle.trim()
    }
  }
}

// 卡片变化事件
const onCardChange = (item: GridItem, index: number) => {
  // console.log('卡片变化:', item, index)
}

// 统计信息
const stats = computed(() => ({
  totalCards: items.value.length,
  totalGrids: items.value.reduce((sum, item) => sum + item.size.width * item.size.height, 0),
  types: cardData.value.reduce((acc, card) => {
    acc[card.type] = (acc[card.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}))
</script>

<template>
  <div class="app-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <h1>📱 拖拽网格组件 Demo</h1>
        <p>支持拖拽、缩放、新建、删除等功能</p>
      </div>
      <div class="toolbar-right">
        <div class="stats">
          <span>📊 卡片: {{ stats.totalCards }}</span>
          <span>🔲 网格: {{ stats.totalGrids }}</span>
          <span>📈 图表: {{ stats.types.chart || 0 }}</span>
          <span>📋 表格: {{ stats.types.table || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- 拖拽网格 -->
    <div class="grid-container">
      <DraggableGrid 
        v-model="items" 
        :grid-x-count="12" 
        :grid-y-count="9" 
        :grid-gap="10"
        @add="onAdd"
        @change="onCardChange"
      >
        <template #card="{ item, index }">
          <div class="card" :style="{ borderColor: getCardData(item.id)?.color }">
            <div class="card-header">
              <span class="card-icon">{{ getCardData(item.id)?.icon }}</span>
              <span class="card-title">{{ getCardData(item.id)?.title }}</span>
              <div class="card-actions">
                <button class="btn-edit" @click.stop="editTitle(item.id)" title="编辑标题">✏️</button>
                <button class="btn-delete" @click.stop="remove(item, index)" title="删除卡片">🗑️</button>
              </div>
            </div>
            <div class="card-content">
              {{ getCardData(item.id)?.content }}
            </div>
            <div class="card-footer">
              <span class="card-size">{{ item.size.width }}×{{ item.size.height }}</span>
              <span class="card-position">{{ item.position.gridX }}, {{ item.position.gridY }}</span>
            </div>
          </div>
        </template>
      </DraggableGrid>
    </div>

    <!-- 底部说明 -->
    <div class="footer">
      <div class="instructions">
        <h3>使用说明：</h3>
        <ul>
          <li>🖱️ <strong>拖拽</strong>：点击卡片拖拽改变位置</li>
          <li>📏 <strong>缩放</strong>：拖拽右下角圆点改变尺寸</li>
          <li>➕ <strong>新建</strong>：点击"New Card"按钮添加卡片</li>
          <li>✏️ <strong>编辑</strong>：点击编辑按钮修改标题</li>
          <li>🗑️ <strong>删除</strong>：点击删除按钮移除卡片</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container { 
  width: 100%; 
  height: 100vh; 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.toolbar-left h1 {
  margin: 0 0 4px 0;
  font-size: 24px;
  color: #333;
}

.toolbar-left p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #666;
}

.stats span {
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 8px;
  border-radius: 4px;
}

.grid-container {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.card { 
  width: 100%; 
  height: 100%; 
  border-radius: 12px; 
  border: 3px solid;
  padding: 16px; 
  box-sizing: border-box; 
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}

.card-icon {
  font-size: 20px;
}

.card-title {
  font-weight: 600;
  color: #333;
  flex: 1;
  font-size: 14px;
}

.card-actions {
  display: flex;
  gap: 4px;
}

.btn-edit, .btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 12px;
  transition: background-color 0.2s;
}

.btn-edit:hover {
  background-color: rgba(70, 185, 185, 0.1);
}

.btn-delete:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.card-content {
  color: #666;
  font-size: 12px;
  line-height: 1.4;
  flex: 1;
  margin-bottom: 12px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #999;
  border-top: 1px solid #eee;
  padding-top: 8px;
}

.footer {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.instructions h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
}

.instructions ul {
  margin: 0;
  padding-left: 20px;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.instructions li {
  margin-bottom: 4px;
}
</style>
