import { COLUMN_CONFIG, ColumnConfig } from '../config/field-config'
import { Issue, SearchResults } from 'jira.js/out/version2/models'
import client from './JiraClient'
import { RangeListValues } from '../config/constant'

import format from 'date-fns/format';

export const getFieldIndex = (field: string, columnConfig?: ColumnConfig) => {
  let _index = -1;
  for (const item of (columnConfig || COLUMN_CONFIG)) {
    if (item.key === field) {
      _index = item.value;
      break;
    }
  }
  return _index;
};

export const getRoleFromSummary = (task: Issue) => {
  // When issueType === 'Task' , role always to 'PM' (SPML-10878)
  if (task.fields.issuetype.id === '10001') {
    return 'PM';
  }

  const reg = /\[([A-Z][A-Z]|[a-z][a-z])]/
  const summary = task.fields?.summary || ''
  if (summary) {
    const r = reg.exec(summary)
    if (r && r[1]) {
      return r[1]
    }
  }
  return ''
}

export const getOwnerName = (task: Issue) => {
  let name: string = task.fields?.assignee?.displayName || task.fields?.assignee?.name || task.fields?.assignee?.emailAddress || ''
  if (name.indexOf('@domain') !== -1) {
    name = name
      .replace(/@.+/, '')
      .replace(/[^A-Za-z]/g, ' ')
      .replace(/(^|\s)[a-z]/g, (s) => s.toUpperCase())
  }
  return name
}

export const getReporterName = (task: Issue) => {
  let name: string = task.fields?.reporter?.displayName || task.fields?.reporter?.name || task.fields?.reporter?.emailAddress || ''
  if (name.indexOf('@domain') !== -1) {
    name = name
      .replace(/@.+/, '')
      .replace(/[^A-Za-z]/g, ' ')
      .replace(/(^|\s)[a-z]/g, (s) => s.toUpperCase())
  }
  return name
}

export const getLabels = (task: Issue) => {
  let labels: string[] = task.fields?.labels || [];
  return labels.join('\n')
}

export const presetFieldFunctions: { [fnName: string]: (task: Issue) => (string | number | null) } = {
  getRoleFromSummary,
  getOwnerName,
  getLabels,
  getReporterName,
}

/**
 * 解析「field.xx.yy」格式的 field 字符串，从task对象取出对应字段的值
 * @author weibin.liang
 * @param task
 * @param field
 */
export const getTaskValueByFieldString = (task: Issue, field: string): (string | number | null) => {
  if (field.indexOf('function') === 0) {
    const fnName = field.replace('function ', '')
    if (presetFieldFunctions[fnName]) {
      return presetFieldFunctions[fnName](task)
    }
  }
  const fieldKeys = field.split('.');
  let res: any = task;
  fieldKeys.forEach((key) => {
    if (res && res[key]) {
      res = res[key];
    } else {
      res = null;
    }
  });
  return res || '';
};

export const taskToDataArray = (task: Issue, columnConfig: ColumnConfig = COLUMN_CONFIG): (string | number | null)[] => {
  const data: (string | number | null)[] = []
  columnConfig.forEach(cfg => {
    if (typeof cfg.value === 'number' && cfg.field) {
      data[cfg.value] = `${getTaskValueByFieldString(task, cfg.field)}`;
      if (cfg.format) {
        data[cfg.value] = cfg.format(data[cfg.value])
      }
    }
  })
  return data
}

/**
 * 把很多 subtasks 按照 parent Task 来分组 的interface
 */
export interface TaskGroups {
  [parentKey: string]: Issue[]
}

/**
 * 给 task 列表按 parent 分组，使用上面定义的 TaskGroups 结构来返回
 * @param taskList
 */
export const groupByParentKey = (taskList: Issue[]): TaskGroups => {
  const res: TaskGroups = {}

  taskList.forEach((task) => {
    const parentKey = task.fields?.parent?.key || ''
    if (!res[parentKey]) {
      res[parentKey] = []
    }
    res[parentKey].push(task)
  })

  return res
}

/**
 * 对已经按 parent 分好组的 subtasks，从 jira 获取其排序（jira 中的 subtask 是可以手动拖拽排序的），
 *    按照 jira 上的顺序给每一组 subtasks 排序
 * @param taskGroups
 */
export const sortByParent = (taskGroups: TaskGroups): Promise<TaskGroups> => {
  return new Promise((resolve) => {
    const parentKeyList = Object.keys(taskGroups)
    // const parentJql = `key in (${parentKeyList.map(k => `"${k}"`).filter(k => !!k).join(',')})`

    const issuePs = parentKeyList.map((issueIdOrKey) => {
      return client.issues.getIssue({ issueIdOrKey })
    })
    Promise.all(issuePs).then((issues) => {
      issues.forEach(parentTask => {
        const sortRanks: { [key: string]: number } = {}
        const subtasks = parentTask.fields?.subtasks
        subtasks.forEach((subtask, index) => {
          sortRanks[subtask.key] = index + 1
        })
        if (taskGroups[parentTask.key]) {
          taskGroups[parentTask.key].sort((a, b) => (
            (sortRanks[a.key] || Number.POSITIVE_INFINITY) - (sortRanks[b.key] || Number.POSITIVE_INFINITY)
          ))
        }
      })
      resolve(taskGroups)
    })
    //   _client.issueSearch
    //     .searchForIssuesUsingJql({
    //       jql: parentJql,
    //       startAt: 0,
    //       maxResults: 9999,
    //     })
    //     .then((res: SearchResults) => {
    //       const issues = res.issues
    //       debugger;
    //       issues.forEach(parentTask => {
    //         const sortRanks: {[key: string]: number} = {}
    //         const subtasks = parentTask.fields?.subtasks
    //         subtasks.forEach((subtask, index) => {
    //           sortRanks[subtask.key] = index + 1
    //         })
    //         if (taskGroups[parentTask.key]) {
    //           taskGroups[parentTask.key].sort((a, b) => (
    //             (sortRanks[a.key] || Number.POSITIVE_INFINITY) - (sortRanks[b.key] || Number.POSITIVE_INFINITY)
    //           ))
    //         }
    //       })
    //       resolve(taskGroups)
    //     })
  })
}

/**
 * 组合上面两个函数，先分组、后排序
 * @param taskList
 */
export const groupAndSortByParentKey = (taskList: Issue[]): Promise<TaskGroups> =>
  sortByParent(groupByParentKey(taskList))

/**
 * 将Date对象转化为字符串，格式为"yyyyMMdd"
 * @param date
 */
export const date2yyyymmdd = (date: Date) => {
  return format(date, "yyyyMMdd");
}

export const isoDateToNormalizedDate = (isoDate: string | any): string => {
  if (typeof isoDate !== 'string') {
    return isoDate
  }
  const replaceReg = /T[0-1]?\d:\d\d:\d\d(\.\d+)?Z?.*$/
  const res = isoDate.replace(replaceReg, '')
  const normalizedReg = /^\d\d(\d\d)?-\d?\d-\d?\d$/
  if (normalizedReg.test(res)) {
    return res
  }
  return isoDate
}

export const debounce = (fn, delay = 100) => {
  let timer: NodeJS.Timeout = null;
  return function () {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(fn, delay);
  }
}

export const getSelectedLineRowsAndValues = (): Promise<{ rows: string[], values: RangeListValues }> => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((jsonRowsAndValues: string) => {
        const rowsAndValues: { rows: string[], values: RangeListValues } = JSON.parse(jsonRowsAndValues)
        rowsAndValues.values.forEach((a, i) =>
          a.forEach((b, j) =>
            b.forEach((c, k) =>
              rowsAndValues.values[i][j][k] = isoDateToNormalizedDate(c)
            )
          )
        )
        console.log('getSelectedLineRowsAndValues', rowsAndValues)
        resolve(rowsAndValues)
      })
      .withFailureHandler((error, object) => {
        console.log('Error in `getSelectedLineRowsAndValues`.', error, object)
        reject(error)
      })
      .getSelectedLineRowsAndValues()
  });
}

export const searchForIssuesUsingJql = (jql: string): Promise<Issue[]> => {
  return client.issueSearch
    .searchForIssuesUsingJql({
      jql,
      startAt: 0,
      maxResults: 9999,
    })
    .then((res: SearchResults) => {
      // const issues = res.issues
      // if (!/order by/i.test(jql)) {
      //   issues.sort((a, b) => {
      //     const roleA = getRoleFromSummary(a)
      //     const roleB = getRoleFromSummary(b)
      //     if (roleA === roleB) {
      //       return a.key > b.key ? 1 : -1
      //     }
      //     return roleA > roleB ? 1 : -1
      //   })
      // }
      // return issues
      return res.issues
    })
    .catch((e) => {
      console.error(e)
      throw e
    })
}

export const toast = (message: string) => {
  const fun = google?.script?.run?.showSuccessToast;
  if (typeof fun !== 'undefined') {
    fun(message);
  } else {
    alert(message)
  }
}