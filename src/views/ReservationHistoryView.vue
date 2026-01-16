<template>
  <div class="screen">
    <div class="header">
      <div class="header-icon">📖</div>
      <h2>あなたの予約</h2>
    </div>
    
    <div class="booking-content">
      <!-- ローディング -->
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>読み込み中...</p>
      </div>
      
      <!-- 空状態 -->
      <div v-else-if="reservations.length === 0" class="empty-state">
        <div class="empty-state-icon">📋</div>
        <p class="empty-state-text">予約がありません</p>
      </div>
      
      <!-- 予約一覧 -->
      <template v-else>
        <!-- これからの予約 -->
        <div v-if="upcomingReservations.length > 0" class="booking-section">
          <h3 class="section-title">これからの予約</h3>
          <div 
            v-for="reservation in upcomingReservations" 
            :key="reservation.id"
            class="booking-card"
            @click="openDetail(reservation)"
          >
            <div class="booking-header">
              <span class="booking-number">{{ reservation.reservationNumber }}</span>
              <span class="status-badge" :class="'status-' + reservation.status">
                {{ getStatusLabel(reservation.status) }}
              </span>
            </div>
            <div class="booking-date">
              <span>📅 {{ formatDate(reservation.reservationDate) }}</span>
              <span>⏰ {{ reservation.reservationTime }}</span>
            </div>
            <div class="booking-location">
              <div class="location-item">
                <span>📍</span>
                <span>{{ reservation.pickupLocation }}</span>
              </div>
              <div class="location-item">
                <span>📍</span>
                <span>{{ reservation.dropOffLocation }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 過去の予約 -->
        <div v-if="pastReservations.length > 0" class="booking-section">
          <h3 class="section-title">過去の予約</h3>
          <div 
            v-for="reservation in pastReservations" 
            :key="reservation.id"
            class="booking-card past"
            @click="openDetail(reservation)"
          >
            <div class="booking-header">
              <span class="booking-number">{{ reservation.reservationNumber }}</span>
              <span class="status-badge" :class="'status-' + reservation.status">
                {{ getStatusLabel(reservation.status) }}
              </span>
            </div>
            <div class="booking-date">
              <span>📅 {{ formatDate(reservation.reservationDate) }}</span>
              <span>⏰ {{ reservation.reservationTime }}</span>
            </div>
            <div class="booking-location">
              <div class="location-item">
                <span>📍</span>
                <span>{{ reservation.pickupLocation }}</span>
              </div>
              <div class="location-item">
                <span>📍</span>
                <span>{{ reservation.dropOffLocation }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
    
    <div class="footer-btn">
      <button class="btn" @click="goToReservation">
        📋 新しく予約する
      </button>
      <button class="btn btn-secondary" @click="goToHome">
        ホームへ戻る
      </button>
    </div>
    
    <!-- 詳細モーダル -->
    <div v-if="selectedReservation" class="modal-overlay" @click.self="closeDetail">
      <div class="modal">
        <div class="modal-header">
          <h3>予約詳細</h3>
          <button class="modal-close" @click="closeDetail">×</button>
        </div>
        
        <div class="modal-content">
          <div class="modal-number">{{ selectedReservation.reservationNumber }}</div>
          
          <div class="modal-item">
            <span class="modal-label">日時</span>
            <span class="modal-value">
              {{ formatDate(selectedReservation.reservationDate) }} {{ selectedReservation.reservationTime }}
            </span>
          </div>
          
          <div class="modal-item">
            <span class="modal-label">乗車場所</span>
            <span class="modal-value">{{ selectedReservation.pickupLocation }}</span>
          </div>
          
          <div class="modal-item">
            <span class="modal-label">降車場所</span>
            <span class="modal-value">{{ selectedReservation.dropOffLocation }}</span>
          </div>
          
          <div class="modal-item">
            <span class="modal-label">お名前</span>
            <span class="modal-value">{{ selectedReservation.customerName }}</span>
          </div>
          
          <div class="modal-item">
            <span class="modal-label">電話番号</span>
            <span class="modal-value">{{ selectedReservation.customerPhone }}</span>
          </div>
          
          <div class="modal-item">
            <span class="modal-label">ステータス</span>
            <span class="modal-value">
              <span class="status-badge" :class="'status-' + selectedReservation.status">
                {{ getStatusLabel(selectedReservation.status) }}
              </span>
            </span>
          </div>
        </div>
        
        <div class="modal-actions" v-if="canCancel(selectedReservation)">
          <button class="btn btn-danger" @click="handleCancel">
            予約をキャンセル
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReservations } from '../composables/useReservations'

const router = useRouter()
const { 
  reservations, 
  loading, 
  subscribeReservations, 
  cancelReservation,
  getStatusLabel 
} = useReservations()

const selectedReservation = ref(null)
let unsubscribe = null

onMounted(() => {
  unsubscribe = subscribeReservations()
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})

// これからの予約
const upcomingReservations = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return reservations.value.filter(r => {
    const reservationDate = new Date(r.reservationDate)
    reservationDate.setHours(0, 0, 0, 0)
    return reservationDate >= today && r.status !== 'cancelled' && r.status !== 'completed'
  }).sort((a, b) => {
    const dateA = new Date(a.reservationDate + 'T' + a.reservationTime)
    const dateB = new Date(b.reservationDate + 'T' + b.reservationTime)
    return dateA - dateB
  })
})

// 過去の予約
const pastReservations = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return reservations.value.filter(r => {
    const reservationDate = new Date(r.reservationDate)
    reservationDate.setHours(0, 0, 0, 0)
    return reservationDate < today || r.status === 'completed' || r.status === 'cancelled'
  }).sort((a, b) => {
    const dateA = new Date(a.reservationDate + 'T' + a.reservationTime)
    const dateB = new Date(b.reservationDate + 'T' + b.reservationTime)
    return dateB - dateA
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

const canCancel = (reservation) => {
  return reservation.status === 'pending'
}

const openDetail = (reservation) => {
  selectedReservation.value = reservation
}

const closeDetail = () => {
  selectedReservation.value = null
}

const handleCancel = async () => {
  if (!selectedReservation.value) return
  
  if (confirm('この予約をキャンセルしますか？')) {
    try {
      await cancelReservation(selectedReservation.value.id)
      closeDetail()
    } catch (err) {
      alert('キャンセルに失敗しました')
    }
  }
}

const goToHome = () => {
  router.push('/')
}

const goToReservation = () => {
  router.push('/reservation')
}
</script>

<style scoped>
.booking-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.booking-section {
  margin-bottom: 24px;
}

.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.booking-card.past {
  opacity: 0.7;
}

.footer-btn {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* モーダル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modal {
  background-color: white;
  border-radius: 20px;
  width: 100%;
  max-width: 340px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #888;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-content {
  padding: 20px;
}

.modal-number {
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  color: #0078FF;
  margin-bottom: 20px;
  letter-spacing: 1px;
}

.modal-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.modal-label {
  width: 80px;
  font-size: 13px;
  color: #888;
  flex-shrink: 0;
}

.modal-value {
  font-size: 14px;
  color: #333;
}

.modal-actions {
  padding: 16px 20px 20px;
}
</style>


