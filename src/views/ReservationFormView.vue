<template>
  <div class="screen">
    <div class="header">
      <div class="header-icon">📋</div>
      <h2>予約する</h2>
    </div>
    
    <div class="form-content">
      <div class="form-group">
        <label class="form-label">
          <span>📍</span> 乗車場所
        </label>
        <input 
          type="text" 
          class="form-input" 
          :class="{ error: errors.pickupLocation }"
          v-model="formData.pickupLocation"
          placeholder="例: 市役所前"
        >
        <p v-if="errors.pickupLocation" class="error-message">
          {{ errors.pickupLocation }}
        </p>
      </div>
      
      <div class="form-group">
        <label class="form-label">
          <span>📍</span> 降車場所
        </label>
        <input 
          type="text" 
          class="form-input"
          :class="{ error: errors.dropOffLocation }"
          v-model="formData.dropOffLocation"
          placeholder="例: 総合病院"
        >
        <p v-if="errors.dropOffLocation" class="error-message">
          {{ errors.dropOffLocation }}
        </p>
      </div>
      
      <div class="form-group">
        <label class="form-label">
          <span>📅</span> 日付
        </label>
        <input 
          type="date" 
          class="form-input"
          :class="{ error: errors.reservationDate }"
          v-model="formData.reservationDate"
          :min="minDate"
        >
        <p v-if="errors.reservationDate" class="error-message">
          {{ errors.reservationDate }}
        </p>
      </div>
      
      <div class="form-group">
        <label class="form-label">
          <span>⏰</span> 時間
        </label>
        <input 
          type="time" 
          class="form-input"
          :class="{ error: errors.reservationTime }"
          v-model="formData.reservationTime"
        >
        <p v-if="errors.reservationTime" class="error-message">
          {{ errors.reservationTime }}
        </p>
      </div>
      
      <div class="form-group">
        <label class="form-label">
          <span>👤</span> お名前
        </label>
        <input 
          type="text" 
          class="form-input"
          :class="{ error: errors.customerName }"
          v-model="formData.customerName"
          placeholder="例: 山田太郎"
        >
        <p v-if="errors.customerName" class="error-message">
          {{ errors.customerName }}
        </p>
      </div>
      
      <div class="form-group">
        <label class="form-label">
          <span>📞</span> 電話番号
        </label>
        <input 
          type="tel" 
          class="form-input"
          :class="{ error: errors.customerPhone }"
          v-model="formData.customerPhone"
          placeholder="例: 090-1234-5678"
        >
        <p v-if="errors.customerPhone" class="error-message">
          {{ errors.customerPhone }}
        </p>
      </div>
    </div>
    
    <div class="footer-btn">
      <button class="btn" @click="goToConfirm">
        次へ
      </button>
      <button class="btn btn-secondary" @click="goBack">
        戻る
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReservationForm } from '../composables/useReservations'

const router = useRouter()
const { formData, errors, validate } = useReservationForm()

// セッションストレージから保存されたデータを復元
onMounted(() => {
  const savedData = sessionStorage.getItem('reservationFormData')
  if (savedData) {
    const data = JSON.parse(savedData)
    formData.value = { ...formData.value, ...data }
  }
})

// 最小日付（今日）
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const goBack = () => {
  const hasInput = formData.value.pickupLocation ||
                   formData.value.dropOffLocation ||
                   formData.value.reservationDate ||
                   formData.value.reservationTime ||
                   formData.value.customerName ||
                   formData.value.customerPhone

  if (hasInput) {
    if (confirm('入力内容が消えますが、本当に戻りますか？')) {
      router.push('/')
    }
  } else {
    router.push('/')
  }
}

const goToConfirm = () => {
  if (validate()) {
    // フォームデータをセッションストレージに保存
    sessionStorage.setItem('reservationFormData', JSON.stringify(formData.value))
    router.push('/reservation/confirm')
  }
}
</script>

<style scoped>
.footer-btn {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>


