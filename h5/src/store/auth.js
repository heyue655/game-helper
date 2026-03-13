import { create } from 'zustand'
import { silentLogin as apiSilentLogin, exchangeCode as apiExchangeCode } from '../api'

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  initialized: false,

  setAuth: (user, token) => {
    localStorage.setItem('token', token)
    set({ user, token })
  },

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  isLoggedIn: () => !!get().token,

  silentLogin: async (deviceId) => {
    try {
      const res = await apiSilentLogin(deviceId)
      const { token, user } = res.data
      localStorage.setItem('token', token)
      set({ user, token, initialized: true })
      return { success: true, isNewUser: res.data.isNewUser, user: res.data.user }
    } catch (err) {
      console.error('[SilentLogin] failed:', err.message)
      set({ initialized: true })
      return { success: false, error: err.message }
    }
  },

  exchangeCode: async (code) => {
    try {
      const res = await apiExchangeCode(code)
      const { token, user } = res.data
      localStorage.setItem('token', token)
      set({ user, token })
      return { success: true }
    } catch (err) {
      console.error('[ExchangeCode] failed:', err.message)
      return { success: false, error: err.message }
    }
  },

  setInitialized: (value) => set({ initialized: value }),
}))

export default useAuthStore
