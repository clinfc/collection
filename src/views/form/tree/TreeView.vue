<template>
  <el-form
    ref="formRef"
    class="tree-form"
    :model="formState"
    label-width="auto"
    style="max-width: 600px"
  >
    <el-form-item label="参数描述">
      <el-input v-model="formState.name" placeholder="参数描述" />
    </el-form-item>
    <el-form-item label="参数结构">
      <el-tree
        :data="formState.fields"
        node-key="key"
        default-expand-all
        :expand-on-click-node="false"
      >
        <template #default="{ data }">
          <div class="tree-item-custom">
            <el-form-item
              :prop="createInfo(data).paths.field"
              :rules="createInfo(data).rules.field"
            >
              <el-input v-model="data.field" placeholder="字段" @input="createInfo(data).linkage" />
            </el-form-item>
            <el-form-item :prop="createInfo(data).paths.remark" :rules="staticRules.remark">
              <el-input v-model="data.remark" placeholder="字段描述" />
            </el-form-item>
            <el-form-item :prop="createInfo(data).paths.type" :rules="staticRules.type">
              <el-select v-model="data.type" placeholder="字段类型">
                <el-option
                  v-for="(label, value) in options"
                  :key="value"
                  :label="label"
                  :value="value"
                />
              </el-select>
            </el-form-item>
            <div v-if="data.type === FieldType.Enum">
              <el-form-item :prop="createInfo(data).paths.enum" :rules="staticRules.enum">
                <el-select placeholder="枚举" popper-class="tree-form-enum-select">
                  <template #header>
                    <el-tooltip content="新增" placement="top">
                      <el-icon @click="onEnumEdit(data)"><Plus /></el-icon>
                    </el-tooltip>
                  </template>
                  <template v-if="data.enum?.length" #empty>
                    <div
                      v-for="({ label, value }, index) in data.enum"
                      :key="value"
                      class="enum-option"
                    >
                      <div class="enum-option__label">{{ label }}</div>
                      <div class="enum-option__value">{{ value }}</div>
                      <div class="enum-option__action">
                        <el-tooltip content="移除" placement="left">
                          <el-icon @click="data.enum.splice(index, 1)"><Close /></el-icon>
                        </el-tooltip>
                      </div>
                      <div class="enum-option__action">
                        <el-tooltip content="编辑" placement="right">
                          <el-icon @click="onEnumEdit(data, index)"><Edit /></el-icon>
                        </el-tooltip>
                      </div>
                    </div>
                  </template>
                </el-select>
              </el-form-item>
            </div>
            <el-space size="small">
              <el-tooltip content="移除" placement="left">
                <el-icon @click="del(data)">
                  <CircleCloseFilled />
                </el-icon>
              </el-tooltip>
              <el-tooltip content="添加兄弟节点" placement="top">
                <el-icon @click="onAdd(data, false)">
                  <CirclePlusFilled />
                </el-icon>
              </el-tooltip>
              <el-tooltip v-if="hasDescendant(data)" content="添加后代节点" placement="right">
                <el-icon @click="onAdd(data, true)">
                  <CirclePlusFilled />
                </el-icon>
              </el-tooltip>
            </el-space>
          </div>
        </template>
      </el-tree>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">校验</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { CircleCloseFilled, CirclePlusFilled, Close, Edit, Plus } from '@element-plus/icons-vue'
import { useDebounceFn } from '@vueuse/core'
import { ElMessageBox, type FormInstance, type FormItemRule } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

import { NodeIndexKey, ParentNodeKey, RootNodeKey, type TreePath, useTreeHook } from './hook'
import { type EnumTreeItem, FieldType, type ObjectTreeItem, type TreeItem } from './types'

interface FormState {
  name: string
  fields: TreeItem[]
}

type Key = keyof ObjectTreeItem | keyof EnumTreeItem

interface TreeItemInfo {
  rules: { [K in Key]?: FormItemRule[] }
  paths: { [K in Key]?: TreePath }
  linkage(): void
}

let id = 0

function useId() {
  return `t-${id++}`
}

function createItem() {
  return { key: useId() } as TreeItem
}

const options: { [K in FieldType]: string } = {
  [FieldType.String]: '字符串',
  [FieldType.Number]: '数字',
  [FieldType.Boolean]: '布尔',
  [FieldType.Array]: '数组',
  [FieldType.ArrayObject]: '对象数组',
  [FieldType.Object]: '对象',
  [FieldType.Enum]: '枚举',
}

const pathMap = new WeakMap<TreePath, TreeItemInfo>()

const { add, del, path, container, normalize } = useTreeHook<TreeItem>({
  pathBase: ['fields'],
})

const staticRules: { [K in Key]?: FormItemRule[] } = {
  remark: [
    { required: true, message: '请输入描述' },
    { message: '最多输入 20 字符', max: 20 },
  ],
  type: [{ required: true, message: '请选择' }],
  enum: [{ required: true, message: '请添加枚举', type: 'array' }],
}

const formState: FormState = reactive({
  name: '',
  fields: [
    { key: useId(), field: 'name', remark: '姓名', type: FieldType.String },
    { key: useId(), field: 'nick', remark: '昵称', type: FieldType.String },
    { key: useId(), field: 'age', remark: '年龄', type: FieldType.Number },
    {
      key: useId(),
      field: 'kinsfolk',
      remark: '亲属关系',
      type: FieldType.ArrayObject,
      children: [
        { key: useId(), field: 'name', remark: '姓名', type: FieldType.String },
        { key: useId(), field: 'name', remark: '昵称', type: FieldType.String },
        { key: useId(), field: 'age', remark: '年龄', type: FieldType.Number },
        {
          key: useId(),
          field: 'relation',
          remark: '关系',
          type: FieldType.Enum,
          enum: [
            { label: '父子', value: '1' },
            { label: '母女', value: '4' },
          ],
        },
      ],
    },
  ],
})

normalize(formState.fields, formState.fields)

function hasDescendant({ type }: TreeItem) {
  return type === FieldType.ArrayObject || type === FieldType.Object
}

function createInfo(target: TreeItem) {
  const bpath = path(target)
  let option = pathMap.get(bpath)
  if (!option) {
    let repeated: TreeItem[] | void = void 0

    option = {
      rules: {
        field: [
          { required: true, message: '请输入字段' },
          {
            validator(_, value: string, cb) {
              const filtered = (container(target) ?? []).filter((item) => {
                return item.key !== target.key && item.field === value
              })

              if (filtered.length) {
                cb(Error(`字段 ${value} 已存在`))
                repeated = filtered
              } else {
                cb()
              }
            },
          },
        ],
      },
      paths: {
        field: [...bpath, 'field'],
        remark: [...bpath, 'remark'],
        type: [...bpath, 'type'],
        enum: [...bpath, 'enum'],
      },
      linkage: useDebounceFn(() => {
        if (!repeated?.length) return

        const paths = repeated.map((item) => createInfo(item).paths.field as string[])
        formRef.value?.validateField(paths, (isValid) => {
          if (isValid) repeated = void 0
        })
      }, 100),
    }
    pathMap.set(bpath, option)
  }
  return option
}

function onAdd(target: TreeItem, isDescendant: boolean) {
  const _target = isDescendant ? target : (target[ParentNodeKey] ?? target[RootNodeKey])

  add(_target, createItem(), target[NodeIndexKey] + 1)
}

function onEnumEdit(target: EnumTreeItem, index = -1) {
  if (!Array.isArray(target.enum)) target.enum = []

  const isAdd = !~index

  ElMessageBox.prompt('请输入枚举描述', '枚举', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputErrorMessage: '必填',
    inputValue: isAdd ? '' : target.enum![index].label,
    inputValidator(value) {
      return isAdd
        ? !~target.enum!.findIndex((e) => e.label === value)
        : !~target.enum!.findIndex((e, i) => e.label === value && i !== index)
    },
  }).then(({ value }) => {
    if (isAdd) target.enum.push({ label: value, value: String(id++) })
    else target.enum[index].label = value
  })
}

const formRef = ref<FormInstance>()

function onSubmit() {
  formRef.value?.validate()
}

onMounted(onSubmit)
</script>

<style lang="scss" scoped>
.tree-form {
  :deep(.el-tree-node__content) {
    height: auto;
    margin-bottom: 18px;
  }

  .tree-item-custom {
    display: grid;
    grid-template-columns: 120px 120px 200px 120px max-content;
    column-gap: 20px;
  }
}
</style>

<style lang="scss">
.tree-form-enum-select {
  .enum-option {
    display: grid;
    grid-template-columns: 1fr 1fr max-content max-content;
    column-gap: 10px;
    height: 32px;
    line-height: 32px;
    padding: 0 10px;

    &:hover {
      background-color: rgb(217, 236, 255);
    }

    &__label {
      font-weight: 500;
      font-size: 16px;
      color: #606266;
    }

    &__value {
      font-size: 16px;
      color: #c0c4cc;
      text-align: right;
      margin-right: 10px;
    }

    &__action {
      cursor: pointer;
      font-size: 12px;
    }
  }
}
</style>
