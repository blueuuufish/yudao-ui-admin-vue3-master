import request from '@/config/axios'

export interface StudentVO {
  studentId: number
  name: string
  major: string
  category: number
}

// 查询学生列表
export const getStudentPage = async (params) => {
  return await request.get({ url: `/fzu/student/page`, params })
}

// 查询学生详情
export const getStudent = async (id: number) => {
  return await request.get({ url: `/fzu/student/get?id=` + id })
}

// 新增学生
export const createStudent = async (data: StudentVO) => {
  return await request.post({ url: `/fzu/student/create`, data })
}

// 修改学生
export const updateStudent = async (data: StudentVO) => {
  return await request.put({ url: `/fzu/student/update`, data })
}

// 删除学生
export const deleteStudent = async (id: number) => {
  return await request.delete({ url: `/fzu/student/delete?id=` + id })
}

// 导出学生 Excel
export const exportStudent = async (params) => {
  return await request.download({ url: `/fzu/student/export-excel`, params })
}
