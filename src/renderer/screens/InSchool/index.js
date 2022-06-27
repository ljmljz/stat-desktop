import {
  Card,
  Button,
  Table,
  Space,
  Input,
  Modal,
  Form,
  DatePicker,
  message,
} from 'antd'
import { useEffect, useState } from 'react'
import moment from 'moment'
import { db, dbKeyMap } from '../../db'

const Excel = require('exceljs')

const { Search } = Input
const studentInSheets = ['返校生']
const importColumns = ['身份证号', '返校日期', '住校/走读', '备注']
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
    title: '返校日期',
    key: 'returnDate',
    dataIndex: 'returnDate',
  },
  {
    title: '住校/走读',
    key: 'liveInSchool',
    dataIndex: 'liveInSchool',
  },
  {
    title: '备注',
    key: 'note',
    dataIndex: 'note',
  },
]

const LeaveSchoolForm = ({ visible, onOk, onCancel }) => {
  const [form] = Form.useForm()
  const [outOfShenzhen, setOutOfShenzhen] = useState(false)

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

  const handleAddressChange = (e) => {
    if (e.target.value.indexOf('深圳') < 0 && e.target.value !== '') {
      setOutOfShenzhen(true)
    } else {
      setOutOfShenzhen(false)
    }
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
          testResult: '阴性',
          leaveTime: moment(),
        }}
      >
        <Form.Item
          name="address"
          label="校外地址"
          rules={[{ required: true, message: '校外地址必填' }]}
        >
          <Input onBlur={handleAddressChange} />
        </Form.Item>
        {outOfShenzhen ? (
          <div>
            <div>
              <span style={{ color: 'red' }}>
                校外地址为深圳外，需要补充额外信息
              </span>
            </div>
            <Form.Item
              name="health"
              label="健康状况"
              rules={[{ required: true, message: '健康状况必填' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="testResult"
              label="核酸结果"
              rules={[{ required: true, message: '必填' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="testTime"
              label="核酸时间"
              rules={[{ required: true, message: '必填' }]}
            >
              <DatePicker />
            </Form.Item>
            <Form.Item
              name="leaveTime"
              label="离深日期"
              rules={[{ required: true, message: '必填' }]}
            >
              <DatePicker />
            </Form.Item>
            <Form.Item
              name="returnTime"
              label="返回日期"
              rules={[{ required: true, message: '必填' }]}
            >
              <DatePicker />
            </Form.Item>
            <Form.Item
              name="owner"
              label="防疫专员"
              rules={[{ required: true, message: '必填' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="ownerPhone"
              label="专员电话"
              rules={[{ required: true, message: '必填' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="counsellor"
              label="辅导员"
              rules={[{ required: true, message: '必填' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="counsellorPhone"
              label="联系电话"
              rules={[{ required: true, message: '必填' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="note" label="备注">
              <Input.TextArea />
            </Form.Item>
          </div>
        ) : null}
      </Form>
      <style>
        {`
                    .ant-form-item {margin-bottom: 5px !important}
                    `}
      </style>
    </Modal>
  )
}

export const InSchool = (props) => {
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
          <a onClick={() => leaveSchool(record)}>离校</a>
        </Space>
      ),
    },
  ]

  useEffect(() => {
    try {
      ;(async function () {
        const inSchoolStudents = await db.inschool.toArray()
        const studentIds = inSchoolStudents.map((e) => e['studentId'])
        const students = await db.allstudents
          .where('id')
          .anyOf(studentIds)
          .toArray()

        setData(
          inSchoolStudents.map((e) => {
            const student = students.find((s) => s.id === e.studentId)
            return { ...student, ...e, key: e['studentId'] }
          })
        )
      })()
    } catch (err) {
      console.warn(err)
    }
  }, [])

  const leaveSchool = (record) => {
    setVisible(true)
  }

  const importDataToDb = async (rows) => {
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
        d['retrunData'] = row['retrunData']
        d['liveInSchool'] = row['liveInSchool']
        d['note'] = row['note']
        d['studentId'] = d['id']
        d['key'] = d['id']

        db.outschool.add({
          studentId: d['studentId'],
          retrunData: d['returnData'],
          liveInSchool: d['liveInSchool'],
          note: d['note'],
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

  const handleSearch = (e) => {
    console.log(e)
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
    const currentYear = new Date().getFullYear()

    // 深圳内
    if (values['address'].indexOf('深圳') >= 0) {
      try {
        ;(async () => {
          const studentInfo = data.find((e) => e.key === selectedRowKeys[0])
          await db.outschool.add({
            studentId: studentInfo['studentId'],
            address: values['address'],
            note: values['note'],
            inCity: values['address'].indexOf('深圳') >= 0,
            inProvince:
              values['address'].indexOf('深圳') < 0 &&
              values['address'].indexOf('广东') >= 0,
            outProvince:
              values['address'].indexOf('深圳') < 0 &&
              values['address'].indexOf('广东') < 0,
            graduating:
              currentYear - 2000 - parseInt(studentInfo['class'], 10) >= 3,
          })

          await db.inschool
            .where('studentId')
            .equals(studentInfo.studentId)
            .delete()
          message.success('学生离校操作成功，目的地为深圳市内')

          setData([...data.filter((e) => e.key !== selectedRowKeys[0])])
        })()
      } catch (err) {
        console.warn(err)
      }
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
      <Card title="在校学生">
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
          <Button type="primary" style={{ marginLeft: 5 }}>
            新增返校
          </Button>
          <Button type="primary" style={{ marginLeft: 5 }}>
            批量离校
          </Button>
          <Search
            placeholder="input search text"
            onChange={handleSearch}
            style={{ width: 200, marginLeft: 10 }}
          />
        </div>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={data}
          onRow={handleRowEvent}
        />
      </Card>
      <LeaveSchoolForm
        visible={visible}
        onOk={handleModalOk}
        onCancel={() => {
          setVisible(false)
        }}
      />
    </div>
  )
}
