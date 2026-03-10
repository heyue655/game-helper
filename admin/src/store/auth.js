import { create } from 'zustand'

function loadAdmin() {
  try { return JSON.parse(localStorage.getItem('admin_info') || 'null') } catch { return null }
}

const useAdminStore = create((set) => ({
  admin: loadAdmin(),
  token: localStorage.getItem('admin_token') || null,

  setAuth: (admin, token) => {
    localStorage.setItem('admin_token', token)
    localStorage.setItem('admin_info', JSON.stringify(admin))
    set({ admin, token })
  },

  logout: () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_info')
    set({ admin: null, token: null })
  },
}))

export default useAdminStore
