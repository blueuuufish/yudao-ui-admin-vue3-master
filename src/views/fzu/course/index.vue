<template>
<!--  <ContentWrap>-->
<!--    &lt;!&ndash; 搜索工作栏 &ndash;&gt;-->
<!--    <el-form-->
<!--      class="-mb-15px"-->
<!--      :model="queryParams"-->
<!--      ref="queryFormRef"-->
<!--      :inline="true"-->
<!--      label-width="68px"-->
<!--    >-->
<!--      <el-form-item label="课程id" prop="courseId">-->
<!--        <el-input-->
<!--          v-model="queryParams.courseId"-->
<!--          placeholder="请输入课程id"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--          class="!w-240px"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item label="学生id" prop="stuId">-->
<!--        <el-input-->
<!--          v-model="queryParams.stuId"-->
<!--          placeholder="请输入学生id"-->
<!--          clearable-->
<!--          @keyup.enter="handleQuery"-->
<!--          class="!w-240px"-->
<!--        />-->
<!--      </el-form-item>-->
<!--      <el-form-item>-->
<!--        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>-->
<!--        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>-->
<!--        <el-button-->
<!--          type="primary"-->
<!--          plain-->
<!--          @click="openForm('create')"-->
<!--          v-hasPermi="['system:SME-course-schedule:create']"-->
<!--        >-->
<!--          <Icon icon="ep:plus" class="mr-5px" /> 新增-->
<!--        </el-button>-->
<!--        <el-button-->
<!--          type="success"-->
<!--          plain-->
<!--          @click="handleExport"-->
<!--          :loading="exportLoading"-->
<!--          v-hasPermi="['system:SME-course-schedule:export']"-->
<!--        >-->
<!--          <Icon icon="ep:download" class="mr-5px" /> 导出-->
<!--        </el-button>-->
<!--      </el-form-item>-->
<!--    </el-form>-->
<!--  </ContentWrap>-->

  <!-- 列表 -->
  <!-- fullCalendar插件 -->
  <div class="calendar-container">
    <!-- 左边的事件列表 -->
    <div class="event-list-container">
      <!-- 可以拖动的区域 -->
      <div class="draggable-event-list" id="eventListItems" ref="eventListItems">
        <el-card v-for="(item, index) in eventList" class="eventListItems-card eventListItems"
                 :draggable="true" :key="index" :id="item.eventId" :style="{ backgroundColor: item.color }">
          <span :id="item.color">{{ item.eventName }}</span>
        </el-card>
      </div>
    </div>

    <!-- 右边的 FullCalendar -->
    <div class="fullcalendar-container">
      <FullCalendar :options="calendarOptions" style="width:1500px" ref="fullcalendarref" />
    </div>
  </div>

  <!-- 表单弹窗：添加/修改 -->
  <CourseForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import download from '@/utils/download'
import * as CourseApi from '@/api/fzu/course'
import CourseForm from './CourseForm.vue'
import FullCalendar from "@fullcalendar/vue3";
import {Ref} from "vue";
// FullCalendar插件所需引入的
import locale from "@fullcalendar/core/locales/zh-cn"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin, { Draggable } from "@fullcalendar/interaction"

defineOptions({ name: 'Course' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  courseId: null,
  name: null,
  term: null,
  classes: null,
  teacher: null,
  week: null,
  startWeek: null,
  endWeek: null,
  startLesson: null,
  endLesson: null,
  location: null
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/* 一些前端的声明变量 */
interface EventItem {
  eventId: string;
  eventName: string;
  color: string;
}

interface MatchItem {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  color: string;
  textColor?: string;
  editable?: boolean;
}

const eventListItems = ref(null);

const eventList: Ref<EventItem[]> = ref([
  {
    eventId: "99",
    eventName: "马克思主义",
    color: "#FECACA",
  },
  {
    eventId: "2",
    eventName: "智能技术",
    color: "#6EE7B7",
  },
  {
    eventId: "3",
    eventName: "政治经济学",
    color: "#93C5FD",
  }
]);

const matchList: Ref<MatchItem[]> = ref([
  {
    id: "1",
    title: "第一个任务",
    start: "2023-05-26 13:22:24",
    allDay: true,
    color: "#FECACA",
    textColor: "#6B7280"
  },
  {
    id: "11",
    title: "第二个任务",
    start: "2023-05-26 13:22:24",
    allDay: true,
    color: "#6EE7B7"
  },

]);

// 拖曳事件方法
const dropItem = (info: any) => {
  const obj: MatchItem = {
    title: info.draggedEl.innerText,
    id: info.draggedEl.id,
    start: info.dateStr,
    allDay: false, // 设置为false, 才能直接拖动到slot中
    color: info.draggedEl.style.backgroundColor,
    editable: true
  };
  // 如果存在于当前matchList中，那么无法拖动
  let matchedEvent = matchList.value.find(e => e.id === obj.id);
  if (!matchedEvent) {
    matchList.value.push(obj);
  }
};
/*
* 这段代码的逆天的原因估计是时间槽是从8点到20点, 不想改了-zzh
* */
const slotLabelContent = (arg: any) => {
  return "第" + ((arg.time.milliseconds / 100000 - 288) / 36 + 1)  +"节课";
}

const calendarOptions: Ref<any> = ref({
  plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
  // 周视图
  initialView: 'timeGridWeek',
  // 初始视图显示左边时间栏
  weekNumbers: true,
  height: 'auto', // auto: 自适应表格视图
  allDaySlot: false, // 在周视图中,不显示全天选项
  /*
  * TODO: 为了方便设置了一个小时一节课, 需要考虑后续数据库的格式等情况
  * */
  slotDuration: '01:00:00', // 设置时间格为1小时
  slotMinTime: '08:00:00', // 从早上8点开始
  slotMaxTime: '20:00:00', // 到下午4点结束
  // 设置左侧时间栏的显示样式
  slotLabelContent: slotLabelContent,
  locale: locale,
  selectable: true,
  editable: true,
  droppable: true,
  dropAccept: ".eventListItems", // 可被拖进
  dayMaxEventRows: 2.0,
  fixedWeekCount: false,
  drop: dropItem, // 外部拖曳进的实践方法
  handleWindowResize: true,
  windowResizeDelay: 100,
  aspectRatio: 2,
  // 日历上面的按钮和title
  // headerToolbar: {
  //   left: "prevYear,prev,next,nextYear today",
  //   center: "title",
  //   // right: "multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay"
  //   right: "timeGridWeek"
  // },
  // calendarOptions设置不显示日期，只显示周数
  dayHeaderFormat: {
    weekday: 'long'
  },

  events: matchList.value,
  dateClick: (info: any) => {
    console.log(info);
  },
  eventClick: (info: any) => {
    console.log(info);
  },
  // 测试拖动开始时候的时间
  // eventDragStart: (info: any) => {
  // },

  // 当事件拖拽完全结束时触发（无论是否更改了位置）
  // eventDragStop: (info) => {
  // },

  // 当事件拖拽结束并放置在新的位置时触发
  eventDrop: (info: any) => {
    const event = info.event;

    let matchedEvent = matchList.value.find(e => e.id === event.id);
    if (matchedEvent) {
      matchedEvent.start = event.startStr;
      matchedEvent.end = event.endStr;
    }
    console.log(matchList)
  },
  // TODO: 自定义数据展示
  eventContent: (args) => {
    const { event } = args;

    // 你可以根据 event 的属性来自定义显示的内容
    const startTime = event.start.toLocaleTimeString(); // 获取事件的开始时间
    const title = event.title; // 获取事件的标题

    // 返回自定义的 HTML 内容
    return {
      html: `
        <div class="custom-event-content">
          <div class="custom-event-time">hello</div>
          <div class="custom-event-title">${title}</div>
        </div>
      `
    };
  }
});
/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await CourseApi.getCoursePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await CourseApi.deleteCourse(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await CourseApi.exportCourse(queryParams)
    download.excel(data, '课程.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  // getList()
  /* 拖曳所需 */
  if (eventListItems.value) {
    new Draggable(eventListItems.value, {
      itemSelector: ".eventListItems-card"
    });
  }
})
</script>
<style>
.calendar-container {
  display: flex;
}

.fullcalendar-container {
  display: flex;
  width: 80%;
}
.draggable-event-list {
  width: 200px;
}
.eventListItems-card {
  /* cursor: pointer;  */
  margin-bottom: 10px;
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  /* 确保元素占满整个高度 */
  width: 120px;
  height: 30px;
}
/* 设置周视图的每一行的高度 */
.fc .fc-timegrid-slot {
  height: 50px;
}

.fc-timegrid-axis-frame {
  visibility: hidden;
}
.fc-toolbar-chunk {
  display: none;
}
.fc-timegrid-col-frame{
  color: #f5f7f9;
}
.fc-timegrid-axis-cushion {
  visibility: hidden;
}
/* 取消 FullCalendar 周视图中当天的高亮 */
.fc-day-today {
  background-color: inherit !important;
}
</style>
