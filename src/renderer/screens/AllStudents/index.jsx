import { useState, useEffect } from "react";
import { Table, Card, Tag, Input, Button } from "antd"
import { db, dbKeyMap } from "../../db";
const Excel = require('exceljs')

const { Search } = Input

const studentInSheets = ['未返校毕业班市内', '未返校毕业班市外省内', '未返校毕业班省外', '未返校非毕业班市外省内', '未返校非毕业班省外', '返校生']
const columns = [
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
      title: '学校地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '姓名',
      key: 'name',
      dataIndex: 'name',
      
    },
    {
      title: '身份证号',
      key: 'ID',
      dataIndex: 'identify'
    },
    {
        title: '人员类别',
        key: 'category',
        dataIndex: 'category'
    },
    {
        title: '手机号',
        key: 'phone',
        dataIndex: 'phone'
    },
    {
        title: '备注',
        key: 'note',
        dataIndex: 'note'
    },
  ];

export const AllStudents = (props) => {
    const [data, setData] = useState([])
    const [importedFile, setImportedFile] = useState('')

    useEffect(() => {
        try {
            (async function() {
                const students = await db.allstudents.toArray()
                if (students.length > 0) {
                    setData(students.map(e => ({...e, key: e['identify']})))
                }
            })()
        } catch (err) {
            console.warn(err)
        }
        
    }, [])

    let title = []

    async function importDataToDb(data) {
        try {
            // clear the database
            await db.delete()
            await db.open()
            console.log('recreated database')

            data.forEach(d => {
                db.allstudents.add(d)
            })
        } catch (e) {
            console.log(e)
        }
    }

    const openImportDialog= () => {
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
                workbook.xlsx.load(buffer.result).then(data => {
                    setImportedFile(targetFile.name)

                    let rows = []
                    workbook.eachSheet((worksheet, sheetId) => {
                        if (studentInSheets.indexOf(worksheet.name) >= 0) {
                            worksheet.eachRow((row, rowNumber) => {
                                // prepare title
                                if (rowNumber == 2) {
                                    title = row.values.map(e => (e.indexOf('人员类别') >= 0 ? '人员类别' : e.indexOf('学校地址') >= 0 ? '学校地址' : e))
                                }

                                if (rowNumber >= 3 ) {
                                    let dictRow = {}
                                    row.values.forEach((v, i) => {
                                        dictRow[dbKeyMap[title[i]]] = typeof v === 'object' ? v.result : v
                                    })

                                    rows.push(dictRow)
                                }
                            })
                        }
                    })

                    setData(rows.map(e => ({...e, key: e['identify']})))
                    // console.log(rows)
                    importDataToDb(rows)
                })
            }
        }
    }

    async function handleSearch(e) {
        const students = await db.allstudents.toArray()
        console.log(students)
    }

    return (
        <div>
            <Card title="全部学生" bordered={false}>
                <div>
                    <input type="file" id="btn-file" style={{ display: 'none' }} onChange={handleImport} />
                    <Button type="primary" onClick={openImportDialog}>导入</Button>
                    <Search placeholder="input search text" onSearch={handleSearch} style={{ width: 200, marginLeft: 10 }} />
                </div>
                <Table columns={columns} dataSource={data} />
            </Card>
        </div>
    )
}