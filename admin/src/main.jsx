import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ConfigProvider
    locale={zhCN}
    theme={{
      algorithm: theme.defaultAlgorithm,
      token: {
        colorPrimary: '#6366f1',
        colorInfo: '#6366f1',
        colorSuccess: '#22c55e',
        colorWarning: '#f59e0b',
        colorError: '#ef4444',
        colorBgBase: '#f8fafc',
        colorBgContainer: 'rgba(255,255,255,0.72)',
        colorBorder: '#e2e8f0',
        colorText: '#0f172a',
        colorTextSecondary: '#64748b',
        borderRadius: 16,
        controlHeight: 40,
        boxShadowSecondary: '0 14px 40px rgba(99,102,241,0.10)',
        fontFamily: "'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif",
      },
      components: {
        Layout: { bodyBg: 'transparent', headerBg: 'rgba(255,255,255,0.72)', siderBg: 'rgba(255,255,255,0.72)' },
        Card: { colorBgContainer: 'rgba(255,255,255,0.72)' },
        Table: { headerBg: 'rgba(99,102,241,0.06)', rowHoverBg: 'rgba(99,102,241,0.04)' },
        Modal: { contentBg: 'rgba(255,255,255,0.9)' },
      },
    }}
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ConfigProvider>,
)
