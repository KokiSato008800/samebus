<template>
  <div class="screen complete-screen">
    <div class="bubbles">
      <span class="bubble"></span>
      <span class="bubble"></span>
      <span class="bubble"></span>
      <span class="bubble"></span>
      <span class="bubble"></span>
    </div>

    <div class="complete-content">
      <div class="shark-container">
        <div class="shark">🦈</div>
        <div class="sparkles">
          <span>✨</span>
          <span>✨</span>
          <span>✨</span>
        </div>
      </div>

      <h1 class="complete-title">予約完了!</h1>
      <p class="complete-subtitle">さめバスをご利用いただき<br>ありがとうございます</p>

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

      <p class="shark-message">当日お会いできるのを楽しみにしています!</p>
    </div>

    <div class="footer-btn">
      <button class="btn" @click="goToHome">
        ホームへ戻る
      </button>
      <button class="btn btn-secondary" @click="goToHistory">
        予約一覧を見る
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
  background: linear-gradient(180deg, #e8f4fc 0%, #d0ebff 50%, #a5d8ff 100%);
  position: relative;
  overflow: hidden;
}

.bubbles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
}

.bubble {
  position: absolute;
  bottom: -20px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  animation: rise 4s ease-in infinite;
}

.bubble:nth-child(1) { left: 10%; width: 20px; height: 20px; animation-delay: 0s; }
.bubble:nth-child(2) { left: 30%; width: 15px; height: 15px; animation-delay: 1s; }
.bubble:nth-child(3) { left: 50%; width: 25px; height: 25px; animation-delay: 2s; }
.bubble:nth-child(4) { left: 70%; width: 18px; height: 18px; animation-delay: 0.5s; }
.bubble:nth-child(5) { left: 85%; width: 22px; height: 22px; animation-delay: 1.5s; }

@keyframes rise {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-100vh) scale(0.5);
    opacity: 0;
  }
}

.complete-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.shark-container {
  position: relative;
  margin-bottom: 16px;
}

.shark {
  font-size: 80px;
  animation: swim 2s ease-in-out infinite;
}

@keyframes swim {
  0%, 100% {
    transform: translateY(0) rotate(-5deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}

.sparkles {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  display: flex;
  justify-content: space-between;
}

.sparkles span {
  font-size: 20px;
  animation: sparkle 1.5s ease-in-out infinite;
}

.sparkles span:nth-child(1) { animation-delay: 0s; }
.sparkles span:nth-child(2) { animation-delay: 0.3s; }
.sparkles span:nth-child(3) { animation-delay: 0.6s; }

@keyframes sparkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.complete-title {
  font-size: 28px;
  font-weight: 700;
  color: #1971c2;
  text-align: center;
  margin-bottom: 8px;
}

.complete-subtitle {
  font-size: 15px;
  color: #495057;
  text-align: center;
  margin-bottom: 24px;
  line-height: 1.6;
}

.reservation-number-box {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 120, 255, 0.15);
}

.reservation-number-label {
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
}

.reservation-number-value {
  font-size: 26px;
  font-weight: 700;
  color: #1971c2;
  letter-spacing: 2px;
}

.complete-details {
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 120, 255, 0.1);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
}

.detail-item:not(:last-child) {
  border-bottom: 1px solid #e9ecef;
}

.detail-icon {
  font-size: 20px;
}

.detail-text {
  font-size: 14px;
  color: #333;
}

.shark-message {
  margin-top: 20px;
  font-size: 14px;
  color: #1971c2;
  text-align: center;
  font-weight: 500;
}

.footer-btn {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  z-index: 1;
}
</style>


