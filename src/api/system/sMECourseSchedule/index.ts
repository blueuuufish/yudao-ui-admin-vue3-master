import request from '@/config/axios'

export interface SMECourseScheduleVO {
  id: number
  courseId: number
  stuId: number
}

// 查询排课列表
export const getSMECourseSchedulePage = async (params) => {
  return await request.get({ url: `/system/SME-course-schedule/page`, params })
}

// 查询排课详情
export const getSMECourseSchedule = async (id: number) => {
  return await request.get({ url: `/system/SME-course-schedule/get?id=` + id })
}

// 新增排课
export const createSMECourseSchedule = async (data: SMECourseScheduleVO) => {
  return await request.post({ url: `/system/SME-course-schedule/create`, data })
}

// 修改排课
export const updateSMECourseSchedule = async (data: SMECourseScheduleVO) => {
  return await request.put({ url: `/system/SME-course-schedule/update`, data })
}

// 删除排课
export const deleteSMECourseSchedule = async (id: number) => {
  return await request.delete({ url: `/system/SME-course-schedule/delete?id=` + id })
}

// 导出排课 Excel
export const exportSMECourseSchedule = async (params) => {
  return await request.download({ url: `/system/SME-course-schedule/export-excel`, params })
}
