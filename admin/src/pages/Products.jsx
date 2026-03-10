import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Tag, Popconfirm, Modal, Form, Input, InputNumber, Select, message, Typography, Image, Upload } from 'antd'
import { PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { getAdminProducts, createProduct, updateProduct, setProductStatus, deleteProduct, getZones, getAdminGames, uploadFile } from '../api'

const STATUS_COLOR = { ON: 'green', OFF: 'default' }
const STATUS_LABEL = { ON: '已上架', OFF: '已下架' }

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [zones, setZones] = useState([])
  const [games, setGames] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
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

  async function handleUploadThumbnail(file) {
    if (!validateImage(file, 2)) return false
    try {
      setUploadingThumbnail(true)
      const res = await uploadFile(file, 'products')
      const url = res?.data?.url
      if (!url) throw new Error('上传失败')
      form.setFieldValue('thumbnail', url)
      message.success('缩略图上传成功')
    } catch (err) {
      message.error(err.message || '上传失败')
    } finally {
      setUploadingThumbnail(false)
    }
    return false
  }

  useEffect(() => {
    getZones().then((r) => setZones(r.data || []))
    getAdminGames().then((r) => setGames(r.data || []))
  }, [])

  function fetchProducts(p = page, kw = keyword) {
    setLoading(true)
    getAdminProducts({ page: p, pageSize: 20, keyword: kw })
      .then((r) => {
        setProducts(r.data?.items || [])
        setTotal(r.data?.total || 0)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProducts()
  }, [page, keyword])

  async function handleSave() {
    const values = await form.validateFields()
    try {
      if (editingId) {
        await updateProduct(editingId, values)
        message.success('更新成功')
      } else {
        await createProduct(values)
        message.success('创建成功')
      }
      setModalOpen(false)
      fetchProducts()
    } catch {}
  }

  const columns = [
    {
      title: '缩略图',
      dataIndex: 'thumbnail',
      width: 70,
      render: (v) =>
        v ? <Image src={v} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 4 }} /> : '-',
    },
    { title: '游戏', dataIndex: 'gameName', width: 100 },
    { title: '商品名称', dataIndex: 'name', ellipsis: true },
    { title: '所属专区', dataIndex: 'zones', render: (z) => z?.map((x) => <Tag key={x.id}>{x.name}</Tag>) },
    { title: '现价', dataIndex: 'price', width: 90, render: (v) => `￥${v}` },
    { title: '原价', dataIndex: 'originalPrice', width: 90, render: (v) => `￥${v}` },
    { title: '销量', dataIndex: 'sales', width: 70 },
    { title: '浏览量', dataIndex: 'views', width: 80 },
    { title: '状态', dataIndex: 'status', width: 90, render: (v) => <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag> },
    {
      title: '操作',
      width: 200,
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setEditingId(r.id)
              form.setFieldsValue({ ...r, zoneIds: r.zones?.map((z) => z.id) })
              setModalOpen(true)
            }}
          >
            编辑
          </Button>
          {r.status === 'OFF' ? (
            <Button
              size="small"
              type="primary"
              onClick={async () => {
                await setProductStatus(r.id, 'ON')
                message.success('已上架')
                fetchProducts()
              }}
            >
              上架
            </Button>
          ) : (
            <Button
              size="small"
              onClick={async () => {
                await setProductStatus(r.id, 'OFF')
                message.success('已下架')
                fetchProducts()
              }}
            >
              下架
            </Button>
          )}
          {r.status === 'OFF' && (
            <Popconfirm
              title="确认删除？"
              onConfirm={async () => {
                await deleteProduct(r.id)
                message.success('已删除')
                fetchProducts()
              }}
            >
              <Button size="small" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          商品管理
        </Typography.Title>
        <Space>
          <Input.Search
            placeholder="搜索商品名称"
            onSearch={(v) => {
              setKeyword(v)
              setPage(1)
            }}
            allowClear
            style={{ width: 220 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null)
              form.resetFields()
              setModalOpen(true)
            }}
          >
            新增商品
          </Button>
        </Space>
      </div>

      <Table
        dataSource={products}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ current: page, total, pageSize: 20, onChange: (p) => setPage(p) }}
        scroll={{ x: 900 }}
      />

      <Modal
        title={editingId ? '编辑商品' : '新增商品'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={700}
        okText="保存"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="gameName" label="游戏名称" rules={[{ required: true, message: '请选择游戏' }]}>
            <Select
              options={games.filter((g) => g.isActive).map((g) => ({ value: g.name, label: g.name }))}
              placeholder="请选择游戏"
            />
          </Form.Item>
          <Form.Item name="name" label="商品名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="商品描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="price" label="现价" rules={[{ required: true }]}>
              <InputNumber min={0} prefix="￥" style={{ width: 140 }} />
            </Form.Item>
            <Form.Item name="originalPrice" label="原价" rules={[{ required: true }]}>
              <InputNumber min={0} prefix="￥" style={{ width: 140 }} />
            </Form.Item>
          </Space>

          <Form.Item label="商品缩略图" required>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Typography.Text type="secondary">
                图片要求：建议 750x750，支持 JPG/PNG/WebP/SVG，大小不超过 2MB
              </Typography.Text>
              <Space align="start">
                <Upload showUploadList={false} accept="image/*" beforeUpload={handleUploadThumbnail}>
                  <Button icon={<UploadOutlined />} loading={uploadingThumbnail}>
                    上传图片
                  </Button>
                </Upload>
                <Form.Item name="thumbnail" noStyle rules={[{ required: true, message: '请上传商品缩略图' }]}>
                  <Input readOnly placeholder="上传后自动填充图片地址" style={{ width: 360 }} />
                </Form.Item>
              </Space>
              {!!form.getFieldValue('thumbnail') && (
                <Image
                  src={form.getFieldValue('thumbnail')}
                  width={100}
                  height={100}
                  style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }}
                />
              )}
            </Space>
          </Form.Item>

          <Form.Item name="zoneIds" label="所属专区">
            <Select
              mode="multiple"
              options={zones.map((z) => ({ value: z.id, label: z.name }))}
              placeholder="请选择专区"
            />
          </Form.Item>
          <Form.Item name="detailContent" label="商品详情">
            <Input.TextArea rows={4} placeholder="支持 HTML 格式" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
