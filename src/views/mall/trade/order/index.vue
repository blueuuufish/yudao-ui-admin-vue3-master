<template>
  <!-- 搜索 -->
  <ContentWrap>
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="68px"
    >
      <el-form-item label="订单状态" prop="status">
        <el-select v-model="queryParams.status" class="!w-280px" clearable placeholder="全部">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.TRADE_ORDER_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="支付方式" prop="payChannelCode">
        <el-select
          v-model="queryParams.payChannelCode"
          class="!w-280px"
          clearable
          placeholder="全部"
        >
          <el-option
            v-for="dict in getStrDictOptions(DICT_TYPE.PAY_CHANNEL_CODE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-280px"
          end-placeholder="自定义时间"
          start-placeholder="自定义时间"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>
      <el-form-item label="订单来源" prop="terminal">
        <el-select v-model="queryParams.terminal" class="!w-280px" clearable placeholder="全部">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.TERMINAL)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="订单类型" prop="type">
        <el-select v-model="queryParams.type" class="!w-280px" clearable placeholder="全部">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.TRADE_ORDER_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="配送方式" prop="deliveryType">
        <el-select v-model="queryParams.deliveryType" class="!w-280px" clearable placeholder="全部">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.TRADE_DELIVERY_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="queryParams.deliveryType === 1" label="快递公司">
        <el-select v-model="queryParams.logisticsId" class="!w-280px" clearable placeholder="全部">
          <el-option
            v-for="item in deliveryExpressList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="queryParams.deliveryType === 2" label="自提门店">
        <el-select
          v-model="queryParams.pickUpStoreId"
          class="!w-280px"
          clearable
          multiple
          placeholder="全部"
        >
          <el-option
            v-for="item in pickUpStoreList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <!-- TODO puhui 聚合搜索等售后结束后实现-->
      <!-- TODO puhui999：尽量不要用 .k 这样的参数，完整拼写，有完整的业务含义 -->
      <el-form-item label="聚合搜索">
        <el-input
          v-show="true"
          v-model="queryParams[queryType.k]"
          class="!w-280px"
          clearable
          placeholder="请输入"
        >
          <template #prepend>
            <el-select
              v-model="queryType.k"
              class="!w-110px"
              clearable
              placeholder="全部"
              @change="inputChangeSelect"
            >
              <el-option
                v-for="dict in searchList"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column class-name="order-table-col">
        <template #header>
          <!-- TODO @puhui999：小屏幕下，会有偏移，后续看看 -->
          <div class="flex items-center" style="width: 100%">
            <div class="ml-100px mr-200px">商品信息</div>
            <div class="mr-60px">单价(元)/数量</div>
            <div class="mr-60px">售后状态</div>
            <div class="mr-60px">实付金额(元)</div>
            <div class="mr-60px">买家/收货人</div>
            <div class="mr-60px">配送方式</div>
            <div class="mr-60px">订单状态</div>
            <div class="mr-60px">操作</div>
          </div>
        </template>
        <template #default="scope">
          <el-table
            :border="true"
            :data="scope.row.items"
            :header-cell-style="headerStyle"
            :span-method="spanMethod"
            style="width: 100%"
          >
            <el-table-column min-width="300" prop="spuName">
              <template #header>
                <div
                  class="flex items-center"
                  style="width: 100%; height: 35px; background-color: #f7f7f7"
                >
                  <span class="mr-20px">订单号：{{ scope.row.no }} </span>
                  <span class="mr-20px">下单时间：{{ formatDate(scope.row.createTime) }}</span>
                  <span>订单来源：</span>
                  <dict-tag
                    :type="DICT_TYPE.TERMINAL"
                    :value="scope.row.terminal"
                    class="mr-20px"
                  />
                  <span>支付方式：</span>
                  <dict-tag
                    v-if="scope.row.payChannelCode"
                    :type="DICT_TYPE.PAY_CHANNEL_CODE"
                    :value="scope.row.payChannelCode"
                    class="mr-20px"
                  />
                  <v-else v-else class="mr-20px">未支付</v-else>
                  <span v-if="scope.row.payTime" class="mr-20px">
                    支付时间：{{ formatDate(scope.row.payTime) }}
                  </span>
                  <span>订单类型：</span>
                  <dict-tag :type="DICT_TYPE.TRADE_ORDER_TYPE" :value="scope.row.type" />
                </div>
              </template>
              <template #default="{ row }">
                <div class="flex items-center">
                  <el-image
                    :src="row.picUrl"
                    class="mr-10px h-30px w-30px"
                    @click="imagePreview(row.picUrl)"
                  />
                  <span class="mr-10px">{{ row.spuName }}</span>
                  <el-tag
                    v-for="property in row.properties"
                    :key="property.propertyId"
                    class="mr-10px"
                  >
                    {{ property.propertyName }}: {{ property.valueName }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="商品原价*数量" prop="price" width="150">
              <template #default="{ row }">
                {{ floatToFixed2(row.price) }} 元 / {{ row.count }}
              </template>
            </el-table-column>
            <el-table-column label="售后状态" prop="afterSaleStatus" width="120">
              <template #default="{ row }">
                <dict-tag
                  :type="DICT_TYPE.TRADE_ORDER_ITEM_AFTER_SALE_STATUS"
                  :value="row.afterSaleStatus"
                />
              </template>
            </el-table-column>
            <el-table-column align="center" label="实际支付" min-width="120" prop="payPrice">
              <template #default>
                {{ floatToFixed2(scope.row.payPrice) + '元' }}
              </template>
            </el-table-column>
            <el-table-column label="买家/收货人" min-width="160">
              <template #default>
                <!-- 快递发货  -->
                <div v-if="scope.row.deliveryType === 1" class="flex flex-col">
                  <span>买家：{{ scope.row.user.nickname }}</span>
                  <span>
                    收货人：{{ scope.row.receiverName }} {{ scope.row.receiverMobile }}
                    {{ scope.row.receiverAreaName }} {{ scope.row.receiverDetailAddress }}
                  </span>
                </div>
                <!-- 自提  -->
                <div v-if="scope.row.deliveryType === 2" class="flex flex-col">
                  <span>
                    门店名称：
                    {{ pickUpStoreList.find((p) => p.id === scope.row.pickUpStoreId)?.name }}
                  </span>
                  <span>
                    门店手机：
                    {{ pickUpStoreList.find((p) => p.id === scope.row.pickUpStoreId)?.phone }}
                  </span>
                  <span>
                    自提门店:
                    {{
                      pickUpStoreList.find((p) => p.id === scope.row.pickUpStoreId)?.detailAddress
                    }}
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column align="center" label="配送方式" width="120">
              <template #default>
                <dict-tag :type="DICT_TYPE.TRADE_DELIVERY_TYPE" :value="scope.row.deliveryType" />
              </template>
            </el-table-column>
            <el-table-column align="center" label="订单状态" width="120">
              <template #default>
                <dict-tag :type="DICT_TYPE.TRADE_ORDER_STATUS" :value="scope.row.status" />
              </template>
            </el-table-column>
            <el-table-column align="center" fixed="right" label="操作" width="160">
              <template #default>
                <!-- TODO 权限后续补齐 -->
                <div class="flex justify-center items-center">
                  <el-button link type="primary" @click="openDetail(scope.row.id)">
                    <Icon icon="ep:notification" />
                    详情
                  </el-button>
                  <el-dropdown @command="(command) => handleCommand(command, scope.row)">
                    <el-button link type="primary">
                      <Icon icon="ep:d-arrow-right" />
                      更多
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <!-- 如果是【快递】，并且【未发货】，则展示【发货】按钮 -->
                        <el-dropdown-item
                          v-if="scope.row.deliveryType === 1 && scope.row.status === 10"
                          command="delivery"
                        >
                          <Icon icon="ep:takeaway-box" />
                          发货
                        </el-dropdown-item>
                        <el-dropdown-item command="remark">
                          <Icon icon="ep:chat-line-square" />
                          备注
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 各种操作的弹窗 -->
  <OrderDeliveryForm ref="deliveryFormRef" @success="getList" />
  <OrderUpdateRemarkForm ref="updateRemarkForm" @success="getList" />
</template>

<script lang="ts" setup>
import type { FormInstance, TableColumnCtx } from 'element-plus'
import OrderDeliveryForm from '@/views/mall/trade/order/form/OrderDeliveryForm.vue'
import OrderUpdateRemarkForm from '@/views/mall/trade/order/form/OrderUpdateRemarkForm.vue'
import * as TradeOrderApi from '@/api/mall/trade/order'
import * as PickUpStoreApi from '@/api/mall/trade/delivery/pickUpStore'
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { floatToFixed2 } from '@/utils'
import { createImageViewer } from '@/components/ImageViewer'
import * as DeliveryExpressApi from '@/api/mall/trade/delivery/express'

defineOptions({ name: 'TradeOrder' })

const { currentRoute, push } = useRouter() // 路由跳转

const loading = ref(true) // 列表的加载中
const total = ref(2) // 列表的总页数
const list = ref<TradeOrderApi.OrderVO[]>([]) // 列表的数据
const queryFormRef = ref<FormInstance>() // 搜索的表单
// 表单搜索
const queryParams = ref({
  pageNo: 1, // 页数
  pageSize: 10, // 每页显示数量
  status: null, // 订单状态
  payChannelCode: null, // 支付方式
  createTime: null, // 创建时间
  terminal: null, // 订单来源
  type: null, // 订单类型
  deliveryType: null, // 配送方式
  logisticsId: null, // 快递公司
  pickUpStoreId: null // 自提门店
})
const queryType = reactive({ k: '' }) // 订单搜索类型 k

// 订单聚合搜索 select 类型配置
// TODO @puhui999：dynamicSearchList，动态搜索；其它相关的变量和方法，都可以朝着这个变量靠哈；这样更容易理解；
const searchList = ref([
  { value: 'no', label: '订单号' },
  { value: 'userId', label: '用户UID' },
  { value: 'userNickname', label: '用户昵称' },
  { value: 'userMobile', label: '用户电话' }
])
/**
 * 聚合搜索切换查询对象时触发
 * @param val
 */
const inputChangeSelect = (val: string) => {
  searchList.value
    .filter((item) => item.value !== val)
    ?.forEach((item1) => {
      // 清除集合搜索无用属性
      if (queryParams.value.hasOwnProperty(item1.value)) {
        delete queryParams.value[item1.value]
      }
    })
}

const headerStyle = ({ row, columnIndex }: any) => {
  // 表头第一行第一列占 8
  if (columnIndex === 0) {
    row[columnIndex].colSpan = 8
  } else {
    // 其余的不要
    row[columnIndex].colSpan = 0
    return {
      display: 'none'
    }
  }
}

interface SpanMethodProps {
  row: TradeOrderApi.OrderItemRespVO
  column: TableColumnCtx<TradeOrderApi.OrderItemRespVO>
  rowIndex: number
  columnIndex: number
}

const spanMethod = ({ row, rowIndex, columnIndex }: SpanMethodProps) => {
  const len = list.value.find(
    (order) => order.items?.findIndex((item) => item.id === row.id) !== -1
  )?.items?.length
  // 要合并的列，从零开始
  const colIndex = [3, 4, 5, 6, 7]
  if (colIndex.includes(columnIndex)) {
    // 除了第一行其余的不要
    if (rowIndex !== 0) {
      return {
        rowspan: 0,
        colspan: 0
      }
    }
    // 动态合并行
    return {
      rowspan: len,
      colspan: 1
    }
  }
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await TradeOrderApi.getOrderPage(unref(queryParams))
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = async () => {
  queryParams.value.pageNo = 1
  await getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  queryParams.value = {
    pageNo: 1, // 页数
    pageSize: 10, // 每页显示数量
    status: null, // 订单状态
    payChannelCode: null, // 支付方式
    createTime: null, // 创建时间
    terminal: null, // 订单来源
    type: null, // 订单类型
    deliveryType: null, // 配送方式
    logisticsId: null, // 快递公司
    pickUpStoreId: null // 自提门店
  }
  handleQuery()
}

/** 商品图预览 */
const imagePreview = (imgUrl: string) => {
  createImageViewer({
    urlList: [imgUrl]
  })
}

/** 查看订单详情 */
const openDetail = (id: number) => {
  push({ name: 'TradeOrderDetail', params: { orderId: id } })
}

/** 操作分发 */
const deliveryFormRef = ref()
const updateRemarkForm = ref()
const handleCommand = (command: string, row: TradeOrderApi.OrderVO) => {
  switch (command) {
    case 'remark':
      updateRemarkForm.value?.open(row)
      break
    case 'delivery':
      deliveryFormRef.value?.open(row)
      break
  }
}

// 监听路由变化更新列表，解决订单保存/更新后，列表不刷新的问题。
watch(
  () => currentRoute.value,
  () => {
    getList()
  }
)

const pickUpStoreList = ref([]) // 自提门店精简列表
const deliveryExpressList = ref([]) // 物流公司
/** 初始化 **/
onMounted(async () => {
  await getList()
  pickUpStoreList.value = await PickUpStoreApi.getListAllSimple()
  deliveryExpressList.value = await DeliveryExpressApi.getSimpleDeliveryExpressList()
})
</script>
<style lang="scss" scoped>
:deep(.order-table-col > .cell) {
  padding: 0;
}
</style>
