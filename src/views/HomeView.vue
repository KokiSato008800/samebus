<template>
  <div class="screen home-screen">
    <div class="home-content">
      <div class="logo">
        <div class="logo-icon">🚌</div>
        <h1 class="logo-title">さめバス</h1>
        <p class="logo-subtitle">デマンド交通予約サービス</p>
      </div>
      
      <div class="home-buttons">
        <button class="btn" @click="goToReservation">
          <span class="btn-icon">📋</span>
          新しく予約する
        </button>
        
        <button class="btn btn-secondary" @click="goToHistory">
          <span class="btn-icon">📖</span>
          予約を見る
        </button>
      </div>
      
      <div class="driver-link">
        <a href="#" class="driver-link-text" @click.prevent="openDriverLogin">
          運転者の方はこちら →
        </a>
      </div>

      <!-- 運転者ログインモーダル -->
      <div v-if="showDriverLogin" class="modal-overlay" @click.self="closeDriverLogin">
        <div class="modal">
          <div class="modal-header">
            <h3>運転者ログイン</h3>
            <button class="modal-close" @click="closeDriverLogin">×</button>
          </div>
          <div class="modal-content">
            <p class="modal-description">パスワードを入力してください</p>
            <input
              type="password"
              v-model="driverPassword"
              class="password-input"
              placeholder="パスワード"
              @keyup.enter="verifyPassword"
            >
            <p v-if="passwordError" class="error-text">パスワードが違います</p>
          </div>
          <div class="modal-actions">
            <button class="btn" @click="verifyPassword">ログイン</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const showDriverLogin = ref(false)
const driverPassword = ref('')
const passwordError = ref(false)

// 運転者パスワード（本番環境では環境変数などで管理してください）
const DRIVER_PASSWORD = '1234'

const goToReservation = () => {
  router.push('/reservation')
}

const goToHistory = () => {
  router.push('/history')
}

const openDriverLogin = () => {
  showDriverLogin.value = true
  driverPassword.value = ''
  passwordError.value = false
}

const closeDriverLogin = () => {
  showDriverLogin.value = false
  driverPassword.value = ''
  passwordError.value = false
}

const verifyPassword = () => {
  if (driverPassword.value === DRIVER_PASSWORD) {
    // 認証済みフラグをセッションに保存
    sessionStorage.setItem('driverAuthenticated', 'true')
    closeDriverLogin()
    router.push('/driver')
  } else {
    passwordError.value = true
  }
}
</script>

<style scoped>
.home-screen {
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%);
}

.home-content {
  width: 100%;
  max-width: 320px;
  text-align: center;
}

.logo {
  margin-bottom: 48px;
}

.logo-icon {
  font-size: 64px;
  margin-bottom: 16px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.logo-title {
  font-size: 32px;
  font-weight: 700;
  color: #0078FF;
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.logo-subtitle {
  font-size: 14px;
  color: #666;
}

.home-buttons {
  margin-bottom: 32px;
}

.home-buttons .btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-icon {
  font-size: 20px;
}

.driver-link {
  margin-top: 24px;
}

.driver-link-text {
  color: #888;
  font-size: 13px;
  text-decoration: none;
  transition: color 0.2s;
}

.driver-link-text:hover {
  color: #0078FF;
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
  max-width: 300px;
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

.modal-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
  text-align: center;
}

.password-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  text-align: center;
  letter-spacing: 4px;
}

.password-input:focus {
  outline: none;
  border-color: #0078FF;
}

.error-text {
  color: #ff3b30;
  font-size: 13px;
  text-align: center;
  margin-top: 8px;
}

.modal-actions {
  padding: 0 20px 20px;
}

.modal-actions .btn {
  width: 100%;
}
</style>


