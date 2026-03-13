const DEVICE_ID_KEY = 'game_device_id'

export function hasUrlDeviceId() {
  const urlParams = new URLSearchParams(window.location.search)
  return !!urlParams.get('deviceId')
}

export function getDeviceId() {
  const urlParams = new URLSearchParams(window.location.search)
  const urlDeviceId = urlParams.get('deviceId')

  if (urlDeviceId) {
    localStorage.setItem(DEVICE_ID_KEY, urlDeviceId)
    cleanUrlDeviceId()
    return urlDeviceId
  }

  const localDeviceId = localStorage.getItem(DEVICE_ID_KEY)
  if (localDeviceId) {
    return localDeviceId
  }

  const newDeviceId = crypto.randomUUID()
  localStorage.setItem(DEVICE_ID_KEY, newDeviceId)
  return newDeviceId
}

function cleanUrlDeviceId() {
  const url = new URL(window.location.href)
  url.searchParams.delete('deviceId')
  window.history.replaceState({}, '', url.pathname + url.search)
}

export function injectDeviceIdToUrl() {
  const deviceId = localStorage.getItem(DEVICE_ID_KEY) || crypto.randomUUID()
  localStorage.setItem(DEVICE_ID_KEY, deviceId)

  const url = new URL(window.location.href)
  url.searchParams.set('deviceId', deviceId)
  window.history.replaceState({}, '', url.pathname + url.search)
}

export function appendDeviceIdToUrl(url) {
  if (!url) return url
  const deviceId = localStorage.getItem(DEVICE_ID_KEY)
  if (!deviceId) return url

  try {
    const urlObj = new URL(url, window.location.origin)
    urlObj.searchParams.set('deviceId', deviceId)
    return urlObj.toString()
  } catch {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}deviceId=${deviceId}`
  }
}
