import { Table, Card, Space } from "antd"
import { useState, useEffect } from "react"
import moment from 'moment'
import { db, dbKeyMap } from '../../db'

const defaultColumns = [
    {
        title: '姓名',
        key: 'name',
        dataIndex: 'name',
    },
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
      title: '学号',
      dataIndex: 'studentNumber',
      key: 'studentNumber'
    },
    {
        title: '填报日期',
        dataIndex: 'reportDate',
        key: 'reportDate'
    },
    {
        title: '本人电话',
        dataIndex: 'phone',
        key: 'phone'
    },
    {
      title: '居住地址',
      dataIndex: 'liveAddress',
      key: 'liveAddress',
    },
    {
        title: '健康状况',
        key: 'health',
        dataIndex: 'health',
      },
      {
        title: '核酸结果',
        key: 'testResult',
        dataIndex: 'testResult',
      },
      {
        title: '核酸日期',
        key: 'testTime',
        dataIndex: 'testTime',
      },{
        title: '离深日期',
        key: 'leaveTime',
        dataIndex: 'leaveTime',
      },
    {
      title: '返校日期',
      key: 'returnTime',
      dataIndex: 'returnTime',
    },
    {
      title: '防疫专员',
      key: 'owner',
      dataIndex: 'owner',
    },
    {
        title: '专员电话',
        key: 'ownerPhone',
        dataIndex: 'ownerPhone',
      },
      {
        title: '辅导员',
        key: 'counsellor',
        dataIndex: 'counsellor',
      },
      {
        title: '联系电话',
        key: 'counsellorPhone',
        dataIndex: 'counsellorPhone',
      },
    {
      title: '备注',
      key: 'note',
      dataIndex: 'note',
    },
  ]


export const OutShenzhen = (props) => {
    const [data, setData] = useState([])
    const [selectedRowKeys, setSelectedRowKeys] = useState([])

    const columns = [...defaultColumns, {
        title: '操作',
        key: 'action',
        render: (_, record) => (
          <Space size="middle">
            <a onClick={() => leaveSchool(record)}>撤回</a>
          </Space>
        ),
      }]

    useEffect(() => {
        try {
          ;(async function () {
            const outShenzhenStudents = await db.outshenzhen.toArray()

            const studentIds = outShenzhenStudents.map((e) => e['studentId'])
            const students = await db.allstudents
              .where('id')
              .anyOf(studentIds)
              .toArray()

            setData(
                outShenzhenStudents.filter(e => (moment(e['leaveTime']).isSame(moment(), 'day'))).map((e) => {
                    const student = students.find((s) => s.id === e.studentId)
                    return { ...student, ...e, key: e['studentId'] }
              })
            )
          })()
        } catch (err) {
          console.warn(err)
        }
      }, [])

    const onSelectChange = (newSelectedRowKeys) => {
        console.log('selectedRowKeys changed: ', selectedRowKeys)
        setSelectedRowKeys(newSelectedRowKeys)
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    }

    console.log(data)
    return (
        <div>
            <Card title="今日离深学生名单">
                <Table rowSelection={rowSelection} columns={columns} dataSource={data} />
            </Card>
        </div>
    )
}