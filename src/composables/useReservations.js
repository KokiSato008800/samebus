import { ref } from 'vue'

// デモモード（Firebaseなしで動作）
const DEMO_MODE = true

// ローカルストレージのキー
const STORAGE_KEY = 'samebus_reservations'

// ローカルストレージから予約データを取得
const getLocalReservations = () => {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

// ローカルストレージに予約データを保存
const saveLocalReservations = (reservations) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations))
}

// 予約データを管理するComposable
export function useReservations() {
  const reservations = ref([])
  const loading = ref(false)
  const error = ref(null)

  // 予約番号を生成
  const generateReservationNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
    return `R${year}${month}${day}${random}`
  }

  // 全予約を取得
  const fetchReservations = async () => {
    loading.value = true
    error.value = null

    try {
      if (DEMO_MODE) {
        // デモモード: ローカルストレージから取得
        reservations.value = getLocalReservations()
      }
    } catch (err) {
      console.error('予約取得エラー:', err)
      error.value = '予約の取得に失敗しました'
    } finally {
      loading.value = false
    }
  }

  // リアルタイム購読（デモモードではダミー）
  const subscribeReservations = (callback) => {
    if (DEMO_MODE) {
      reservations.value = getLocalReservations()
      if (callback) {
        callback(reservations.value)
      }
      // ダミーのunsubscribe関数を返す
      return () => {}
    }
  }

  // 新規予約を作成
  const createReservation = async (data) => {
    loading.value = true
    error.value = null

    try {
      const reservationData = {
        id: 'demo_' + Date.now(),
        reservationNumber: generateReservationNumber(),
        pickupLocation: data.pickupLocation,
        dropOffLocation: data.dropOffLocation,
        reservationDate: data.reservationDate,
        reservationTime: data.reservationTime,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      if (DEMO_MODE) {
        // デモモード: ローカルストレージに保存
        const currentReservations = getLocalReservations()
        currentReservations.unshift(reservationData)
        saveLocalReservations(currentReservations)
      }

      return reservationData
    } catch (err) {
      console.error('予約作成エラー:', err)
      error.value = '予約の作成に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 予約ステータスを更新
  const updateReservationStatus = async (id, status) => {
    loading.value = true
    error.value = null

    try {
      if (DEMO_MODE) {
        const currentReservations = getLocalReservations()
        const index = currentReservations.findIndex(r => r.id === id)
        if (index !== -1) {
          currentReservations[index].status = status
          currentReservations[index].updatedAt = new Date().toISOString()
          saveLocalReservations(currentReservations)
        }
      }
    } catch (err) {
      console.error('ステータス更新エラー:', err)
      error.value = 'ステータスの更新に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 予約を削除（キャンセル）
  const deleteReservation = async (id) => {
    loading.value = true
    error.value = null

    try {
      if (DEMO_MODE) {
        const currentReservations = getLocalReservations()
        const filtered = currentReservations.filter(r => r.id !== id)
        saveLocalReservations(filtered)
      }
    } catch (err) {
      console.error('予約削除エラー:', err)
      error.value = '予約の削除に失敗しました'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 予約をキャンセル（ステータス変更）
  const cancelReservation = async (id) => {
    return updateReservationStatus(id, 'cancelled')
  }
  
  // 日付でフィルタリング（今日以降 / 過去）
  const filterByDate = (type) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return reservations.value.filter(r => {
      const reservationDate = new Date(r.reservationDate)
      reservationDate.setHours(0, 0, 0, 0)
      
      if (type === 'upcoming') {
        return reservationDate >= today && r.status !== 'cancelled'
      } else if (type === 'past') {
        return reservationDate < today || r.status === 'completed'
      }
      return true
    })
  }
  
  // ステータスでフィルタリング
  const filterByStatus = (status) => {
    if (!status || status === 'all') {
      return reservations.value
    }
    return reservations.value.filter(r => r.status === status)
  }
  
  // ステータスの日本語表示
  const getStatusLabel = (status) => {
    const labels = {
      'pending': '待機中',
      'in_progress': '対応中',
      'completed': '完了',
      'cancelled': 'キャンセル'
    }
    return labels[status] || status
  }
  
  return {
    reservations,
    loading,
    error,
    fetchReservations,
    subscribeReservations,
    createReservation,
    updateReservationStatus,
    deleteReservation,
    cancelReservation,
    filterByDate,
    filterByStatus,
    getStatusLabel
  }
}

// 予約フォームデータを管理するComposable
export function useReservationForm() {
  const formData = ref({
    pickupLocation: '',
    dropOffLocation: '',
    reservationDate: '',
    reservationTime: '',
    customerName: '',
    customerPhone: ''
  })
  
  const errors = ref({})
  
  // バリデーション
  const validate = () => {
    errors.value = {}
    
    if (!formData.value.pickupLocation.trim()) {
      errors.value.pickupLocation = '乗車場所を入力してください'
    }
    
    if (!formData.value.dropOffLocation.trim()) {
      errors.value.dropOffLocation = '降車場所を入力してください'
    }
    
    if (!formData.value.reservationDate) {
      errors.value.reservationDate = '日付を選択してください'
    } else {
      const selectedDate = new Date(formData.value.reservationDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        errors.value.reservationDate = '過去の日付は選択できません'
      }
    }
    
    if (!formData.value.reservationTime) {
      errors.value.reservationTime = '時間を選択してください'
    }
    
    if (!formData.value.customerName.trim()) {
      errors.value.customerName = 'お名前を入力してください'
    }
    
    if (!formData.value.customerPhone.trim()) {
      errors.value.customerPhone = '電話番号を入力してください'
    } else {
      // 電話番号形式チェック（ハイフンあり/なし両対応）
      const phoneRegex = /^[0-9]{2,4}-?[0-9]{2,4}-?[0-9]{3,4}$/
      if (!phoneRegex.test(formData.value.customerPhone)) {
        errors.value.customerPhone = '正しい電話番号を入力してください'
      }
    }
    
    return Object.keys(errors.value).length === 0
  }
  
  // フォームをリセット
  const resetForm = () => {
    formData.value = {
      pickupLocation: '',
      dropOffLocation: '',
      reservationDate: '',
      reservationTime: '',
      customerName: '',
      customerPhone: ''
    }
    errors.value = {}
  }
  
  return {
    formData,
    errors,
    validate,
    resetForm
  }
}


