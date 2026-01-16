<template>
  <div class="screen">
    <div class="header">
      <div class="header-icon">✓</div>
      <h2>予約内容の確認</h2>
    </div>
    
    <div class="form-content">
      <div class="confirm-card">
        <h3 class="confirm-section-title">予約情報</h3>
        
        <div class="confirm-item">
          <span class="confirm-label">乗車場所</span>
          <span class="confirm-value">{{ formData.pickupLocation }}</span>
        </div>
        
        <div class="confirm-item">
          <span class="confirm-label">降車場所</span>
          <span class="confirm-value">{{ formData.dropOffLocation }}</span>
        </div>
        
        <div class="confirm-item">
          <span class="confirm-label">日付</span>
          <span class="confirm-value">{{ formatDate(formData.reservationDate) }}</span>
        </div>
        
        <div class="confirm-item">
          <span class="confirm-label">時間</span>
          <span class="confirm-value">{{ formData.reservationTime }}</span>
        </div>
      </div>
      
      <div class="confirm-card">
        <h3 class="confirm-section-title">お客様情報</h3>
        
        <div class="confirm-item">
          <span class="confirm-label">お名前</span>
          <span class="confirm-value">{{ formData.customerName }}</span>
        </div>
        
        <div class="confirm-item">
          <span class="confirm-label">電話番号</span>
          <span class="confirm-value">{{ formData.customerPhone }}</span>
        </div>
      </div>
      
      <p class="confirm-notice">
        ※ 上記の内容でよろしければ「予約を確定する」を押してください
      </p>
    </div>
    
    <div class="footer-btn">
      <button class="btn btn-success" @click="submitReservation" :disabled="loading">
        {{ loading ? '送信中...' : '予約を確定する' }}
      </button>
      <button class="btn btn-secondary" @click="goBack" :disabled="loading">
        戻る
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReservations } from '../composables/useReservations'

const router = useRouter()
const { createReservation, loading } = useReservations()

const formData = ref({
  pickupLocation: '',
  dropOffLocation: '',
  reservationDate: '',
  reservationTime: '',
  customerName: '',
  customerPhone: ''
})

onMounted(() => {
  // セッションストレージからフォームデータを取得
  const savedData = sessionStorage.getItem('reservationFormData')
  if (savedData) {
    formData.value = JSON.parse(savedData)
  } else {
    // データがない場合は予約フォームに戻る
    router.push('/reservation')
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

const goBack = () => {
  router.push('/reservation')
}

const submitReservation = async () => {
  try {
    const result = await createReservation(formData.value)
    
    // 完了画面に予約番号を渡す
    sessionStorage.setItem('completedReservation', JSON.stringify(result))
    sessionStorage.removeItem('reservationFormData')
    
    router.push('/reservation/complete')
  } catch (err) {
    alert('予約の登録に失敗しました。もう一度お試しください。')
  }
}
</script>

<style scoped>
.confirm-card {
  background-color: #f9f9f9;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
}

.confirm-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #888;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.confirm-notice {
  font-size: 13px;
  color: #888;
  text-align: center;
  margin-top: 16px;
  line-height: 1.6;
}

.footer-btn {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>


