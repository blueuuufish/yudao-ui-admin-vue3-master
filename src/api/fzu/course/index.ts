import request from '@/config/axios'

export interface CourseVO {
  courseId: number
  name: string
  term: string
  classes: string
  teacher: string
  week: number
  startWeek: number
  endWeek: number
  startLesson: number
  endLesson: number
  location: string
  id: number
}

// 查询课程列表
export const getCoursePage = async (params) => {
  return await request.get({ url: `/fzu/course/page`, params })
}

// 查询课程详情
export const getCourse = async (id: number) => {
  return await request.get({ url: `/fzu/course/get?id=` + id })
}

// 新增课程
export const createCourse = async (data: CourseVO) => {
  return await request.post({ url: `/fzu/course/create`, data })
}

// 修改课程
export const updateCourse = async (data: CourseVO) => {
  return await request.put({ url: `/fzu/course/update`, data })
}

// 删除课程
export const deleteCourse = async (id: number) => {
  return await request.delete({ url: `/fzu/course/delete?id=` + id })
}

// 导出课程 Excel
export const exportCourse = async (params) => {
  return await request.download({ url: `/fzu/course/export-excel`, params })
}
