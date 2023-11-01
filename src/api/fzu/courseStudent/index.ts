import request from '@/config/axios'

export interface CourseStudentVO {
  courseId: number
  studentId: number
  id: number
}

// 查询课程学生列表
export const getCourseStudentPage = async (params) => {
  return await request.get({ url: `/fzu/course-student/page`, params })
}

// 查询课程学生详情
export const getCourseStudent = async (id: number) => {
  return await request.get({ url: `/fzu/course-student/get?id=` + id })
}

// 新增课程学生
export const createCourseStudent = async (data: CourseStudentVO) => {
  return await request.post({ url: `/fzu/course-student/create`, data })
}

// 修改课程学生
export const updateCourseStudent = async (data: CourseStudentVO) => {
  return await request.put({ url: `/fzu/course-student/update`, data })
}

// 删除课程学生
export const deleteCourseStudent = async (id: number) => {
  return await request.delete({ url: `/fzu/course-student/delete?id=` + id })
}

// 导出课程学生 Excel
export const exportCourseStudent = async (params) => {
  return await request.download({ url: `/fzu/course-student/export-excel`, params })
}
