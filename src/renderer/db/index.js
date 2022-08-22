import Dexie from 'dexie'

export const db = new Dexie('statistic')
export const dbKeyMap = {
  学院: 'college',
  班级: 'class',
  学校地址: 'address',
  姓名: 'name',
  身份证号: 'identify',
  手机号: 'phone',
  备注: 'note',
  人员类别: 'category',
  返校日期: 'returnDate',
  '住校/走读': 'liveInSchool',
  居住地址: 'liveAddress',
  健康状态: 'health',
  核酸检测结果: 'testResult',
  核酸时间: 'testTime',
  离深时间: 'leaveTime',
  返深时间: 'returnTime',
  部门防疫专员: 'owner',
  联系电话: 'ownerPhone',
  辅导员: 'counsellor',
  联系电话1: 'counsellorPhone',
  备注: 'note',
  学号: 'studentNumber',
}

db.version(1).stores({
  allstudents:
    '++id, college, class, address, name, identify, category, phone, note',
  inschool: '++id, studentId, returnDate, liveInSchool, note',
  outschool:
    '++id, studentId, address, inCity, inProvince, outProvince, graduating, note',
  outshenzhen:
    '++id, studentId, studentNumber, liveAddress, health, testResult, reportDate, testTime, leaveTime, returnTime, owner, ownerPhone, counsellor, counsellorPhone, note',
})
