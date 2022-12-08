export interface ColumnConfigItem {
  key: string
  value: number
  field?: string,
  useJira?: boolean, // jira值强制覆盖column值
  format?: (value: any) => string //对 Jira 的数据格式做转换
}

export type ColumnConfig = ColumnConfigItem[]

export const COLUMN_CONFIG: ColumnConfig = [
  {
    key: 'Priority',
    value: 0,
  },
  {
    key: 'TopicName',
    field: 'fields.summary',
    value: 1,
  },
  {
    key: 'ExpectUATDate', // same with Planned UAT Start Date
    value: 2,
    field: 'fields.customfield_11522',
  },
  {
    key: 'ExpectLiveDate', // same with Planned Release Date
    value: 3,
    field: 'fields.customfield_11513',
  },
  {
    key: 'Status',
    value: 4,
    field: 'fields.status.name',
    format: function (value: string) {
      return JIRA_STATUS_MAP[value] || value;
    }
  },
  {
    key: 'IsInPlan',
    value: 5,
  },
  {
    key: 'Epic',
    value: 6,
  },
  {
    key: 'Task',
    value: 7,
    field: 'key',
  },
  {
    key: 'Role',
    value: 8,
    field: 'function getRoleFromSummary'
  },
  {
    key: 'Owner',
    value: 9,
    field: 'function getOwnerName'
  },
  {
    key: 'StoryPoints',
    field: 'fields.customfield_10100',
    value: 10,
  },
  {
    key: 'DueDate',
    value: 11,
    field: 'fields.duedate',
  },
  {
    key: 'StartDate', // upload sheets only
    value: 12,
    field: 'fields.customfield_11200',
  },
  {
    key: 'Deps', // qc sheets, not used
    value: 12,
  },
  {
    key: 'Remarks',
    value: 13,
  },
  {
    key: 'BE',
    value: 14,
  },
  {
    key: 'FE',
    value: 15,
  },
  {
    key: 'QA',
    value: 16,
  },
  {
    key: 'UI',
    value: 17,
  },
  {
    key: 'BPM',
    value: 18,
  },
];

// Listing 需求设计阶段
export const REQUIREMENT_COLUMN_CONFIG: ColumnConfig = [
  {
    key: 'PlannedPRDEndDate',
    value: 0,
    field: 'fields.customfield_12407',
    useJira: true
  },
  {
    key: 'TopicName',
    field: 'fields.summary',
    value: 1,
  },
  {
    key: 'ExpectUATDate', // same with Planned UAT Start Date
    value: 2,
    field: 'fields.customfield_11522',
  },
  {
    key: 'ExpectLiveDate', // same with Planned Release Date
    value: 3,
    field: 'fields.customfield_11513',
  },
  {
    key: 'Status',
    value: 4,
    field: 'fields.status.name',
  },
  {
    key: 'Labels', //需求目标文件
    value: 5,
    field: 'function getLabels',
    useJira: true
  },
  {
    key: 'Epic',
    value: 6,
  },
  {
    key: 'Task',
    value: 7,
    field: 'key',
  },
  {
    key: 'Role',
    value: 8,
    field: 'function getRoleFromSummary'
  },
  {
    key: 'Owner',
    value: 9,
    field: 'function getReporterName'
  },
  {
    key: 'StoryPoints',
    field: 'fields.customfield_10100',
    value: 10,
  },
  {
    key: 'DueDate',
    value: 11,
    field: 'fields.duedate',
  },
  {
    key: 'StartDate', // upload sheets only
    value: 12,
    field: 'fields.customfield_11200',
  },
  {
    key: 'Remarks',
    value: 13,
  },
  {
    key: 'BE',
    value: 14,
  },
  {
    key: 'FE',
    value: 15,
  },
  {
    key: 'QA',
    value: 16,
  },
  {
    key: 'UI',
    value: 17,
  },
  {
    key: 'BPM',
    value: 18,
  },
];

export const SCORE_CONFIG: ColumnConfig = [
  {
    key: 'Task',
    value: 0,
    field: 'key',
  },
  {
    key: 'TopicName',
    field: 'fields.summary',
    value: 1,
  },
  {
    key: 'Owner',
    value: 2,
    field: 'function getOwnerName'
  },
  {
    key: 'StoryPoints',
    field: 'fields.customfield_10100',
    value: 3,
  },
  {
    key: 'Score',
    field: 'fields.customfield_10907.value',
    value: 8,
  },
]

export const TASKSCORE_TITLE = [
  'Task',
  'Summary',
  'Member',
  'StoryPoint',
  '业务复杂度',
  '技术复杂度',
  '紧急度',
  '主动反馈',
  'Score'
]
export enum PRD_CONFIG {
  TopicName = 1,
  UATDate = 2,
  LiveDate = 3,
  IsInPlan = 5,
  Epic = 6,
  Task = 7,
  Owner = 9
}

/**
 * Jira 的状态和目标文件里的状态可能不一致，通过这个映射表配置å
 */
export const JIRA_STATUS_MAP: { [x: string]: string } = {
  'TO DO': 'To Do'
}