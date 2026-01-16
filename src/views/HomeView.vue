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
        <router-link to="/driver" class="driver-link-text">
          運転者の方はこちら →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToReservation = () => {
  router.push('/reservation')
}

const goToHistory = () => {
  router.push('/history')
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
</style>


