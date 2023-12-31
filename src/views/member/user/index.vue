<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="用户昵称" prop="nickname">
        <el-input
          v-model="queryParams.nickname"
          placeholder="请输入用户昵称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input
          v-model="queryParams.mobile"
          placeholder="请输入手机号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="注册时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="登录时间" prop="loginDate">
        <el-date-picker
          v-model="queryParams.loginDate"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="用户标签" prop="tagIds">
        <MemberTagSelect v-model="queryParams.tagIds" />
      </el-form-item>
      <el-form-item label="用户等级" prop="levelId">
        <MemberLevelSelect v-model="queryParams.levelId" />
      </el-form-item>
      <el-form-item label="用户分组" prop="groupId">
        <MemberGroupSelect v-model="queryParams.groupId" />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button @click="openCoupon" v-hasPermi="['promotion:coupon:send']">发送优惠券</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="用户编号" align="center" prop="id" width="120px" />
      <el-table-column label="头像" align="center" prop="avatar" width="80px">
        <template #default="scope">
          <img :src="scope.row.avatar" style="width: 40px" />
        </template>
      </el-table-column>
      <el-table-column label="手机号" align="center" prop="mobile" width="120px" />
      <el-table-column label="昵称" align="center" prop="nickname" width="80px" />
      <el-table-column label="等级" align="center" prop="levelName" width="100px" />
      <el-table-column label="分组" align="center" prop="groupName" width="100px" />
      <el-table-column
        label="用户标签"
        align="center"
        prop="tagNames"
        :show-overflow-tooltip="false"
      >
        <template #default="scope">
          <el-tag v-for="(tagName, index) in scope.row.tagNames" :key="index" class="mr-5px">
            {{ tagName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="积分" align="center" prop="point" width="100px" />
      <el-table-column label="状态" align="center" prop="status" width="100px">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        label="登录时间"
        align="center"
        prop="loginDate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="注册时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" width="180px" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openDetail(scope.row.id)">详情</el-button>
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['member:user:update']"
          >
            编辑
          </el-button>
          <!-- todo 放到更多菜单中 -->
          <el-button
            link
            type="primary"
            @click="updateLevelFormRef.open(scope.row.id)"
            v-hasPermi="['member:user:update-level']"
          >
            修改等级
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <UserForm ref="formRef" @success="getList" />
  <!-- 修改用户等级弹窗 -->
  <UpdateLevelForm ref="updateLevelFormRef" @success="getList" />
  <!-- 发送优惠券弹窗 -->
  <CouponSendForm ref="couponSendFormRef" />
</template>
<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import * as UserApi from '@/api/member/user'
import { DICT_TYPE } from '@/utils/dict'
import UserForm from './UserForm.vue'
import MemberTagSelect from '@/views/member/tag/components/MemberTagSelect.vue'
import MemberLevelSelect from '@/views/member/level/components/MemberLevelSelect.vue'
import MemberGroupSelect from '@/views/member/group/components/MemberGroupSelect.vue'
import UpdateLevelForm from '@/views/member/user/UpdateLevelForm.vue'
import CouponSendForm from '@/views/mall/promotion/coupon/components/CouponSendForm.vue'

defineOptions({ name: 'MemberUser' })

const message = useMessage() // 消息弹窗

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  nickname: null,
  mobile: null,
  loginDate: [],
  createTime: [],
  tagIds: [],
  levelId: null,
  groupId: null
})
const queryFormRef = ref() // 搜索的表单
const updateLevelFormRef = ref() // 修改会员等级表单
const selectedIds = ref<number[]>([]) // 表格的选中 ID 数组

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserApi.getUserPage(queryParams)
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

/** 打开会员详情 */
const { push } = useRouter()
const openDetail = (id: number) => {
  push({ name: 'MemberUserDetail', params: { id } })
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 表格选中事件 */
const handleSelectionChange = (rows: UserApi.UserVO[]) => {
  selectedIds.value = rows.map((row) => row.id)
}

/** 发送优惠券 */
const couponSendFormRef = ref()
const openCoupon = () => {
  if (selectedIds.value.length === 0) {
    message.warning('请选择要发送优惠券的用户')
    return
  }
  couponSendFormRef.value.open(selectedIds.value)
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
