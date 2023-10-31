<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="课程id" prop="courseId">
        <el-input v-model="formData.courseId" placeholder="请输入课程id" />
      </el-form-item>
      <el-form-item label="课程名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入课程名称" />
      </el-form-item>
      <el-form-item label="学期" prop="term">
        <el-input v-model="formData.term" placeholder="请输入学期" />
      </el-form-item>
      <el-form-item label="班级" prop="classes">
        <el-input v-model="formData.classes" placeholder="请输入班级" />
      </el-form-item>
      <el-form-item label="老师" prop="teacher">
        <el-input v-model="formData.teacher" placeholder="请输入老师" />
      </el-form-item>
      <el-form-item label="周" prop="week">
        <el-input v-model="formData.week" placeholder="请输入周" />
      </el-form-item>
      <el-form-item label="开始周" prop="startWeek">
        <el-input v-model="formData.startWeek" placeholder="请输入开始周" />
      </el-form-item>
      <el-form-item label="结束周" prop="endWeek">
        <el-input v-model="formData.endWeek" placeholder="请输入结束周" />
      </el-form-item>
      <el-form-item label="开始节" prop="startLesson">
        <el-input v-model="formData.startLesson" placeholder="请输入开始节" />
      </el-form-item>
      <el-form-item label="结束节" prop="endLesson">
        <el-input v-model="formData.endLesson" placeholder="请输入结束节" />
      </el-form-item>
      <el-form-item label="地点" prop="location">
        <el-input v-model="formData.location" placeholder="请输入地点" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import * as CourseApi from '@/api/fzu/course'

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  courseId: undefined,
  name: undefined,
  term: undefined,
  classes: undefined,
  teacher: undefined,
  week: undefined,
  startWeek: undefined,
  endWeek: undefined,
  startLesson: undefined,
  endLesson: undefined,
  location: undefined,
  id: undefined
})
const formRules = reactive({
  courseId: [{ required: true, message: '课程id不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await CourseApi.getCourse(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as CourseApi.CourseVO
    if (formType.value === 'create') {
      await CourseApi.createCourse(data)
      message.success(t('common.createSuccess'))
    } else {
      await CourseApi.updateCourse(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    courseId: undefined,
    name: undefined,
    term: undefined,
    classes: undefined,
    teacher: undefined,
    week: undefined,
    startWeek: undefined,
    endWeek: undefined,
    startLesson: undefined,
    endLesson: undefined,
    location: undefined,
    id: undefined
  }
  formRef.value?.resetFields()
}
</script>
