<template>
  <div class="screen driver-screen">
    <div class="header">
      <div class="header-icon driver-icon">🚌</div>
      <h2>運転者ダッシュボード</h2>
    </div>
    
    <!-- フィルターバー -->
    <div class="filter-bar">
      <button 
        class="filter-chip" 
        :class="{ active: currentFilter === 'all' }"
        @click="setFilter('all')"
      >
        すべて
      </button>
      <button 
        class="filter-chip" 
        :class="{ active: currentFilter === 'pending' }"
        @click="setFilter('pending')"
      >
        待機中 ({{ statusCounts.pending }})
      </button>
      <button 
        class="filter-chip" 
        :class="{ active: currentFilter === 'in_progress' }"
        @click="setFilter('in_progress')"
      >
        対応中 ({{ statusCounts.in_progress }})
      </button>
      <button
        class="filter-chip"
        :class="{ active: currentFilter === 'completed' }"
        @click="setFilter('completed')"
      >
        完了 ({{ statusCounts.completed }})
      </button>
      <button
        class="filter-chip"
        :class="{ active: currentFilter === 'cancelled' }"
        @click="setFilter('cancelled')"
      >
        キャンセル ({{ statusCounts.cancelled }})
      </button>
    </div>
    
    <!-- 日付フィルター -->
    <div class="date-filter">
      <label>日付:</label>
      <input type="date" v-model="selectedDate" class="date-input">
      <button class="all-dates-btn" :class="{ active: !selectedDate }" @click="selectedDate = ''">全日付</button>
    </div>
    
    <div class="booking-content">
      <!-- ローディング -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>読み込み中...</p>
      </div>
      
      <!-- 空状態 -->
      <div v-else-if="filteredReservations.length === 0" class="empty-state">
        <div class="empty-state-icon">📋</div>
        <p class="empty-state-text">該当する予約がありません</p>
      </div>
      
      <!-- 予約一覧 -->
      <div v-else class="reservation-list">
        <div 
          v-for="reservation in filteredReservations" 
          :key="reservation.id"
          class="driver-card"
          :class="'card-' + reservation.status"
        >
          <div class="card-header">
            <span class="card-number">{{ reservation.reservationNumber }}</span>
            <span class="status-badge" :class="'status-' + reservation.status">
              {{ getStatusLabel(reservation.status) }}
            </span>
          </div>
          
          <div class="card-datetime">
            <span>📅 {{ formatDate(reservation.reservationDate) }}</span>
            <span>⏰ {{ reservation.reservationTime }}</span>
          </div>
          
          <div class="card-route">
            <div class="route-item">
              <span class="route-dot start"></span>
              <span>{{ reservation.pickupLocation }}</span>
            </div>
            <div class="route-line"></div>
            <div class="route-item">
              <span class="route-dot end"></span>
              <span>{{ reservation.dropOffLocation }}</span>
            </div>
          </div>
          
          <div class="card-customer">
            <span>👤 {{ reservation.customerName }}</span>
            <a :href="'tel:' + reservation.customerPhone" class="phone-link">
              📞 {{ reservation.customerPhone }}
            </a>
          </div>
          
          <!-- ステータス変更ボタン -->
          <div class="status-actions" v-if="reservation.status !== 'completed' && reservation.status !== 'cancelled'">
            <button
              v-if="reservation.status === 'pending'"
              class="status-btn status-btn-cancel"
              @click="handleCancel(reservation.id)"
            >
              キャンセル
            </button>
            <button
              v-if="reservation.status === 'pending'"
              class="status-btn status-btn-progress"
              @click="changeStatus(reservation.id, 'in_progress')"
            >
              対応開始
            </button>
            <button
              v-if="reservation.status === 'in_progress'"
              class="status-btn status-btn-complete"
              @click="changeStatus(reservation.id, 'completed')"
            >
              完了
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- リアルタイムインジケーター -->
    <div class="realtime-indicator">
      <span class="realtime-dot"></span>
      リアルタイム更新中
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useReservations } from '../composables/useReservations'

const {
  reservations,
  loading,
  subscribeReservations,
  updateReservationStatus,
  cancelReservation,
  getStatusLabel
} = useReservations()

const currentFilter = ref('all')
const selectedDate = ref('')
let unsubscribe = null

onMounted(() => {
  // 今日の日付をデフォルトに設定
  const today = new Date()
  selectedDate.value = today.toISOString().split('T')[0]
  
  // リアルタイム購読開始
  unsubscribe = subscribeReservations()
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})

// ステータス別カウント
const statusCounts = computed(() => {
  const counts = {
    pending: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0
  }
  
  let filtered = reservations.value
  
  // 日付フィルター適用
  if (selectedDate.value) {
    filtered = filtered.filter(r => r.reservationDate === selectedDate.value)
  }
  
  filtered.forEach(r => {
    if (counts[r.status] !== undefined) {
      counts[r.status]++
    }
  })
  
  return counts
})

// フィルター適用済み予約
const filteredReservations = computed(() => {
  let filtered = reservations.value
  
  // 日付フィルター
  if (selectedDate.value) {
    filtered = filtered.filter(r => r.reservationDate === selectedDate.value)
  }
  
  // ステータスフィルター
  if (currentFilter.value !== 'all') {
    filtered = filtered.filter(r => r.status === currentFilter.value)
  }
  
  // 時間でソート
  return filtered.sort((a, b) => {
    const timeA = a.reservationTime || '00:00'
    const timeB = b.reservationTime || '00:00'
    return timeA.localeCompare(timeB)
  })
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDays = ['日', '月', '火', '水', '木', '金', '土']
  const weekDay = weekDays[date.getDay()]
  return `${month}月${day}日（${weekDay}）`
}

const setFilter = (filter) => {
  currentFilter.value = filter
}

const changeStatus = async (id, status) => {
  try {
    await updateReservationStatus(id, status)
  } catch (err) {
    alert('ステータスの更新に失敗しました')
  }
}

const handleCancel = async (id) => {
  if (confirm('この予約をキャンセルしますか？')) {
    try {
      await cancelReservation(id)
    } catch (err) {
      alert('キャンセルに失敗しました')
    }
  }
}
</script>

<style scoped>
.driver-screen {
  background-color: #f5f5f5;
}

.driver-icon {
  background: linear-gradient(135deg, #34c759 0%, #30d158 100%) !important;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
}

.date-filter label {
  font-size: 14px;
  color: #666;
}

.date-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
}

.all-dates-btn {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.all-dates-btn.active {
  background-color: #0078FF;
  color: white;
  border-color: #0078FF;
}

.booking-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.reservation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.driver-card {
  background-color: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #ccc;
}

.driver-card.card-pending {
  border-left-color: #ffcc00;
}

.driver-card.card-in_progress {
  border-left-color: #0078FF;
}

.driver-card.card-completed {
  border-left-color: #34c759;
  opacity: 0.7;
}

.driver-card.card-cancelled {
  border-left-color: #ff3b30;
  opacity: 0.5;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-number {
  font-size: 14px;
  font-weight: 700;
  color: #0078FF;
  letter-spacing: 0.5px;
}

.card-datetime {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
  font-weight: 500;
}

.card-route {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
}

.route-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #333;
}

.route-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.route-dot.start {
  background-color: #34c759;
}

.route-dot.end {
  background-color: #ff3b30;
}

.route-line {
  width: 2px;
  height: 16px;
  background-color: #ddd;
  margin-left: 4px;
  margin: 4px 0 4px 4px;
}

.card-customer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #666;
}

.phone-link {
  color: #0078FF;
  text-decoration: none;
}

.realtime-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background-color: white;
  border-top: 1px solid #e0e0e0;
  font-size: 12px;
  color: #888;
}

.realtime-dot {
  width: 8px;
  height: 8px;
  background-color: #34c759;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.status-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.status-btn:active {
  opacity: 0.8;
}

.status-btn-cancel {
  background-color: #ff3b30;
  color: white;
}

.status-btn-progress {
  background-color: #0078FF;
  color: white;
}

.status-btn-complete {
  background-color: #34c759;
  color: white;
}
</style>


