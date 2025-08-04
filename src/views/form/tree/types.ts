export enum FieldType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Array = 'array',
  ArrayObject = 'array-object',
  Object = 'object',
  Enum = 'enum',
}

export interface EnumOption {
  label: string
  value: string
}

export interface TreeItemBase<T extends FieldType = FieldType> {
  key: string
  field: string
  remark: string
  type: T
  [k: symbol]: any
}

export type NormalTreeItem = TreeItemBase<
  FieldType.String | FieldType.Number | FieldType.Boolean | FieldType.Array
>

export interface ObjectTreeItem extends TreeItemBase<FieldType.ArrayObject | FieldType.Object> {
  children: TreeItemBase[]
}

export interface EnumTreeItem extends TreeItemBase<FieldType.Enum> {
  enum: EnumOption[]
}

export type TreeItem = NormalTreeItem | ObjectTreeItem | EnumTreeItem
