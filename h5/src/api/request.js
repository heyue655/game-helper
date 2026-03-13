import axios from 'axios'
import { getDeviceId } from '../utils/deviceId'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

request.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    const msg = err.response?.data?.message || '网络错误'
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      const deviceId = getDeviceId()
      if (deviceId) {
        try {
          const res = await axios.post(
            (import.meta.env.VITE_API_BASE_URL || '/api') + '/auth/silent',
            { deviceId }
          )
          if (res.data?.data?.token) {
            localStorage.setItem('token', res.data.data.token)
            err.config.headers.Authorization = `Bearer ${res.data.data.token}`
            return axios.request(err.config)
          }
        } catch {
          // 静默登录失败
        }
      }
      window.location.href = '/login'
    }
    return Promise.reject(new Error(msg))
  },
)

export default request
