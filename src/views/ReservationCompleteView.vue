<template>
  <div class="screen complete-screen">
    <div class="complete-content">
      <div class="complete-icon">✓</div>
      <h1 class="complete-title">予約が完了しました</h1>
      <p class="complete-subtitle">ご利用ありがとうございます</p>
      
      <div class="reservation-number-box">
        <p class="reservation-number-label">予約番号</p>
        <p class="reservation-number-value">{{ reservation.reservationNumber }}</p>
      </div>
      
      <div class="complete-details">
        <div class="detail-item">
          <span class="detail-icon">📅</span>
          <span class="detail-text">{{ formatDate(reservation.reservationDate) }} {{ reservation.reservationTime }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-icon">📍</span>
          <span class="detail-text">{{ reservation.pickupLocation }} → {{ reservation.dropOffLocation }}</span>
        </div>
      </div>
    </div>
    
    <div class="footer-btn">
      <button class="btn" @click="goToHistory">
        予約一覧を見る
      </button>
      <button class="btn btn-secondary" @click="goToHome">
        ホームへ戻る
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const reservation = ref({
  reservationNumber: '',
  reservationDate: '',
  reservationTime: '',
  pickupLocation: '',
  dropOffLocation: ''
})

onMounted(() => {
  const savedReservation = sessionStorage.getItem('completedReservation')
  if (savedReservation) {
    reservation.value = JSON.parse(savedReservation)
  } else {
    router.push('/')
  }
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDays = ['日', '月', '火', '水', '木', '金', '土']
  const weekDay = weekDays[date.getDay()]
  return `${year}年${month}月${day}日（${weekDay}）`
}

const goToHistory = () => {
  sessionStorage.removeItem('completedReservation')
  router.push('/history')
}

const goToHome = () => {
  sessionStorage.removeItem('completedReservation')
  router.push('/')
}
</script>

<style scoped>
.complete-screen {
  justify-content: center;
  padding: 20px;
}

.complete-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.complete-details {
  width: 100%;
  background-color: #f9f9f9;
  border-radius: 16px;
  padding: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
}

.detail-item:not(:last-child) {
  border-bottom: 1px solid #eee;
}

.detail-icon {
  font-size: 20px;
}

.detail-text {
  font-size: 14px;
  color: #333;
}

.footer-btn {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>


