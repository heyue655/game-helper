import React, { useEffect, useState } from 'react'
import { Table, Typography, Space, Button, Popconfirm, Modal, Form, Input, Switch, message, Alert, Upload } from 'antd'
import { PlusOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons'
import { getAdminBanners, createBanner, updateBanner, deleteBanner, uploadFile } from '../api'

export default function BannersPage() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [form] = Form.useForm()

  function validateImage(file, maxSizeMB = 2) {
    if (!file?.type?.startsWith('image/')) {
      message.error('仅支持图片文件')
      return false
    }
    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      message.error(`图片不能超过 ${maxSizeMB}MB`)
      return false
    }
    return true
  }

  async function handleUploadBanner(file) {
    if (!validateImage(file, 2)) return false
    try {
      setUploadingBanner(true)
      const res = await uploadFile(file, 'banners')
      const url = res?.data?.url
      if (!url) throw new Error('上传失败')
      form.setFieldValue('imageUrl', url)
      message.success('Banner 上传成功')
    } catch (err) {
      message.error(err.message || '上传失败')
    } finally {
      setUploadingBanner(false)
    }
    return false
  }

  function fetchBanners() {
    setLoading(true)
    getAdminBanners()
      .then((r) => setBanners(r.data || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  async function handleSave() {
    const values = await form.validateFields()
    if (editingId) {
      await updateBanner(editingId, values)
      message.success('更新成功')
    } else {
      await createBanner(values)
      message.success('创建成功')
    }
    setModalOpen(false)
    fetchBanners()
  }

  const columns = [
    {
      title: '预览',
      dataIndex: 'imageUrl',
      width: 220,
      render: (v) => (
        <img
          src={v}
          alt="banner"
          style={{ width: 180, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid #303030' }}
        />
      ),
    },
    { title: '图片地址', dataIndex: 'imageUrl', ellipsis: true },
    { title: '跳转链接', dataIndex: 'link', width: 220, ellipsis: true },
    { title: '排序', dataIndex: 'sort', width: 80 },
    {
      title: '启用',
      dataIndex: 'isActive',
      width: 90,
      render: (v, r) => (
        <Switch
          checked={v}
          onChange={(checked) => updateBanner(r.id, { isActive: checked }).then(fetchBanners)}
        />
      ),
    },
    {
      title: '操作',
      width: 150,
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setEditingId(r.id)
              form.setFieldsValue(r)
              setModalOpen(true)
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除？"
            onConfirm={async () => {
              await deleteBanner(r.id)
              message.success('已删除')
              fetchBanners()
            }}
          >
            <Button size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Banner 管理
        </Typography.Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchBanners}>
            刷新
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null)
              form.resetFields()
              form.setFieldsValue({ sort: 0, isActive: true })
              setModalOpen(true)
            }}
          >
            新增 Banner
          </Button>
        </Space>
      </div>

      {/* <Alert
        type="info"
        showIcon
        style={{ marginBottom: 12 }}
        message="系统首次启动会自动生成 3 张默认 Banner（王者荣耀 / 英雄联盟 / 三角洲，主题：和悦网游）"
      /> */}

      <Table rowKey="id" loading={loading} dataSource={banners} columns={columns} pagination={false} />

      <Modal
        title={editingId ? '编辑 Banner' : '新增 Banner'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="保存"
      >
        <Form form={form} layout="vertical" initialValues={{ sort: 0, isActive: true }}>
          <Form.Item label="Banner 图片" required>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Typography.Text type="secondary">
                图片要求：建议 1200x420，支持 JPG/PNG/WebP/SVG，大小不超过 2MB
              </Typography.Text>
              <Space align="start">
                <Upload
                  showUploadList={false}
                  accept="image/*"
                  beforeUpload={handleUploadBanner}
                >
                  <Button icon={<UploadOutlined />} loading={uploadingBanner}>上传图片</Button>
                </Upload>
                <Form.Item name="imageUrl" noStyle rules={[{ required: true, message: '请上传 Banner 图片' }]}>
                  <Input placeholder="上传后自动填充图片地址" readOnly style={{ width: 360 }} />
                </Form.Item>
              </Space>
              {!!form.getFieldValue('imageUrl') && (
                <img
                  src={form.getFieldValue('imageUrl')}
                  alt="banner-preview"
                  style={{ width: 220, height: 76, objectFit: 'cover', borderRadius: 6, border: '1px solid #303030' }}
                />
              )}
            </Space>
          </Form.Item>
          <Form.Item name="link" label="跳转链接">
            <Input placeholder="/zone?game=honor-of-kings" />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <Input type="number" />
          </Form.Item>
          <Form.Item name="isActive" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
