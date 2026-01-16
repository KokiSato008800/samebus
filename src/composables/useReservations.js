import { ref } from 'vue'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '../firebase/config'

// 予約データを管理するComposable
export function useReservations() {
  const reservations = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // コレクション参照
  const reservationsRef = collection(db, 'reservations')
  
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
      const q = query(reservationsRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      
      reservations.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Timestampを日付文字列に変換
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      }))
    } catch (err) {
      console.error('予約取得エラー:', err)
      error.value = '予約の取得に失敗しました'
    } finally {
      loading.value = false
    }
  }
  
  // リアルタイム購読
  const subscribeReservations = (callback) => {
    const q = query(reservationsRef, orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      }))
      
      reservations.value = data
      
      if (callback) {
        callback(data)
      }
    }, (err) => {
      console.error('リアルタイム購読エラー:', err)
      error.value = 'リアルタイム更新に失敗しました'
    })
    
    return unsubscribe
  }
  
  // 新規予約を作成
  const createReservation = async (data) => {
    loading.value = true
    error.value = null
    
    try {
      const reservationData = {
        reservationNumber: generateReservationNumber(),
        pickupLocation: data.pickupLocation,
        dropOffLocation: data.dropOffLocation,
        reservationDate: data.reservationDate,
        reservationTime: data.reservationTime,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      const docRef = await addDoc(reservationsRef, reservationData)
      
      return {
        id: docRef.id,
        ...reservationData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
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
      const docRef = doc(db, 'reservations', id)
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp()
      })
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
      const docRef = doc(db, 'reservations', id)
      await deleteDoc(docRef)
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


