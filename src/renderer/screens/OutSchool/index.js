import {
  Card,
  Button,
  Table,
  Select,
  Form,
  Input,
  DatePicker,
  Space,
  Modal,
  message,
} from 'antd'
import { useEffect, useState } from 'react'
import moment from 'moment'
import { db, dbKeyMap } from '../../db'

const Excel = require('exceljs')

const studentInSheets = [
  '未返校毕业班市内',
  '未返校毕业班市外省内',
  '未返校毕业班省外',
  '未返校非毕业班市外省内',
  '未返校非毕业班省外',
]
const importColumns = ['身份证号', '学校地址', '备注']
const defaultColumns = [
  {
    title: '学院',
    dataIndex: 'college',
    key: 'name',
    render: (text) => <a>{text}</a>,
  },
  {
    title: '班级',
    dataIndex: 'class',
    key: 'class',
  },
  {
    title: '地址',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: '姓名',
    key: 'name',
    dataIndex: 'name',
  },
  {
    title: '手机号',
    key: 'phone',
    dataIndex: 'phone',
  },
  {
    title: '毕业班',
    key: 'graduating',
    dataIndex: 'graduating',
    render: (text) => (text ? '是' : '否'),
  },
  {
    title: '所在地',
    key: 'city',
    dataIndex: 'inCity',
    render: (text, record) => {
      return record.inCity ? '市内' : record.inProvince ? '市外省内' : '省外'
    },
  },
  {
    title: '备注',
    key: 'note',
    dataIndex: 'note',
  },
]

const ReturnToSchoolForm = ({ visible, onOk, onCancel }) => {
  const [form] = Form.useForm()

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 20 },
    },
  }

  return (
    <Modal
      visible={visible}
      title={'离校信息填报'}
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onOk(values)
          })
          .catch((err) => {
            console.log('Validate Failed:', err)
          })
      }}
    >
      <Form
        form={form}
        name="leave-school-form"
        {...formItemLayout}
        initialValues={{
          returnDate: moment(),
          liveInSchool: '住校',
        }}
      >
        <Form.Item
          name="address"
          label="校内地址"
          rules={[{ required: true, message: '校内地址必填' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="returnDate"
          label="返回日期"
          rules={[{ required: true, message: '必填' }]}
        >
          <DatePicker />
        </Form.Item>
        <Form.Item
          name="liveInSchool"
          label="住校/走读"
          rules={[{ required: true, message: '必填' }]}
        >
          <Select>
            <Select.Option value="住校">住校</Select.Option>
            <Select.Option value="走读">走读</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="note" label="备注">
          <Input.TextArea />
        </Form.Item>
      </Form>
      <style>
        {`
                    .ant-form-item {margin-bottom: 5px !important}
                    `}
      </style>
    </Modal>
  )
}

export const OutSchool = (props) => {
  const [data, setData] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [visible, setVisible] = useState(false)

  let title = []
  const columns = [
    ...defaultColumns,
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => returnToSchool(record)}>返校</a>
        </Space>
      ),
    },
  ]

  const returnToSchool = (record) => {
    setVisible(true)
  }

  useEffect(() => {
    try {
      ;(async function () {
        const outSchoolStudents = await db.outschool.toArray()
        const studentIds = outSchoolStudents.map((e) => e['studentId'])
        const students = await db.allstudents
          .where('id')
          .anyOf(studentIds)
          .toArray()

        setData(
          outSchoolStudents.map((e) => {
            const student = students.find((s) => s.id === e.studentId)
            return { ...student, ...e, key: e['studentId'] }
          })
        )
      })()
    } catch (err) {
      console.warn(err)
    }
  }, [])

  const importDataToDb = async (rows) => {
    const currentYear = new Date().getFullYear()

    try {
      const identifies = rows.map((e) => e['identify'])

      await db.outschool.clear()
      console.log('out school cleared')

      let students = await db.allstudents
        .where('identify')
        .anyOf(identifies)
        .toArray()
      students.forEach((d) => {
        const row = rows.find((r) => r['identify'] === d['identify'])
        d['studentId'] = d['id']
        d['address'] = row['address']
        d['note'] = row['note']
        d['inCity'] = d['address'].indexOf('深圳') >= 0
        d['inProvince'] =
          d['address'].indexOf('深圳') < 0 && d['address'].indexOf('广东') >= 0
        d['outProvince'] =
          d['address'].indexOf('深圳') < 0 && d['address'].indexOf('广东') < 0
        d['graduating'] = currentYear - 2000 - parseInt(d['class'], 10) >= 3
        d['key'] = d['id']

        db.outschool.add({
          studentId: d['studentId'],
          address: d['address'],
          note: d['note'],
          inCity: d['inCity'],
          inProvince: d['inProvince'],
          outProvince: d['outProvince'],
          graduating: d['graduating'],
        })
      })

      setData(students)
    } catch (err) {
      console.warn(err)
    }
  }

  const openImportDialog = () => {
    const btn = document.getElementById('btn-file')
    btn.click()
  }

  const handleImport = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      const targetFile = files[0]
      const buffer = new FileReader()
      buffer.readAsArrayBuffer(targetFile)
      buffer.onload = (e) => {
        const workbook = new Excel.Workbook()
        workbook.xlsx.load(buffer.result).then((data) => {
          let rows = []
          workbook.eachSheet((worksheet, sheetId) => {
            if (studentInSheets.indexOf(worksheet.name) >= 0) {
              worksheet.eachRow(async (row, rowNumber) => {
                // prepare title
                if (rowNumber == 2) {
                  title = row.values.map((e) =>
                    e.indexOf('人员类别') >= 0
                      ? '人员类别'
                      : e.indexOf('学校地址') >= 0
                      ? '学校地址'
                      : e
                  )
                }

                if (rowNumber >= 3) {
                  let dictRow = {}
                  row.values.forEach((v, i) => {
                    if (importColumns.indexOf(title[i]) >= 0) {
                      dictRow[dbKeyMap[title[i]]] =
                        typeof v === 'object' ? v.result : v
                    }
                  })
                  rows.push(dictRow)
                }
              })
            }
          })

          importDataToDb(rows)
        })
      }
    }
  }

  const onSelectChange = (newSelectedRowKeys) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys)
    setSelectedRowKeys(newSelectedRowKeys)
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  }

  const handleModalOk = (values) => {
    try {
      ;(async () => {
        const studentInfo = data.find((e) => e.key === selectedRowKeys[0])
        await db.inschool.add({
          studentId: studentInfo['studentId'],
          returnDate: values['returnDate'].format('YYYYMMDD'),
          liveInSchool: values['liveInSchool'],
          note: values['note'],
        })

        await db.outschool
          .where('studentId')
          .equals(studentInfo.studentId)
          .delete()
        message.success('学生返校成功，数据已更新到在校表中')
        setData([...data.filter((e) => e.key !== selectedRowKeys[0])])
      })()
    } catch (err) {
      console.warn(err)
    }

    setVisible(false)
  }

  const handleRowEvent = (record) => {
    return {
      onClick: () => {
        setSelectedRowKeys([record.key])
      },
    }
  }

  return (
    <div>
      <Card title="未返校学生">
        <div>
          <input
            type="file"
            id="btn-file"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
          <Button type="primary" onClick={openImportDialog}>
            导入
          </Button>
          <Button type="primary">新增</Button>
        </div>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={data}
          onRow={handleRowEvent}
        />
      </Card>
      <ReturnToSchoolForm
        visible={visible}
        onOk={handleModalOk}
        onCancel={() => {
          setVisible(false)
        }}
      />
    </div>
  )
}
