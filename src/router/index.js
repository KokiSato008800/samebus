import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ReservationFormView from '../views/ReservationFormView.vue'
import ReservationConfirmView from '../views/ReservationConfirmView.vue'
import ReservationCompleteView from '../views/ReservationCompleteView.vue'
import ReservationHistoryView from '../views/ReservationHistoryView.vue'
import DriverDashboardView from '../views/DriverDashboardView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/reservation',
    name: 'reservation',
    component: ReservationFormView
  },
  {
    path: '/reservation/confirm',
    name: 'reservation-confirm',
    component: ReservationConfirmView
  },
  {
    path: '/reservation/complete',
    name: 'reservation-complete',
    component: ReservationCompleteView
  },
  {
    path: '/history',
    name: 'history',
    component: ReservationHistoryView
  },
  {
    path: '/driver',
    name: 'driver',
    component: DriverDashboardView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router


