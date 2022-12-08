/**
 * @file GAS for update tasks from jira
 * @description 更新 task 信息填入表格
 * 
 */

/**
 * 是否過濾隱藏行（慢）
 * @type {boolean}
 */
const UPDATE_TASK_FROM_JIRA_FILTER_HIDDEN_ROW = false;

/**
 * 更新一波 tasks
 * @param {(string | number | null)[][]} tasks
 * @return {{[taskKey: string]: string}} 导入成功的提示语（每个 Task 分别有）
 */
function updateTasks(tasks) {
  const tips = {};
  const highlightRows = [];
  const col = _getKeyColumnNum();
  tasks.forEach(task => {
    const key = task[col];
    const rows = _findTaskRowInA1RangeList(
      key,
      UPDATE_TASK_FROM_JIRA_FILTER_HIDDEN_ROW ?
        _getNotHiddenFilteredSelectedA1Notations() :
        _getFilteredSelectedA1Notations()
    )
      .map(row => row + 1);
    if (rows.length) {
      rows.forEach(row => {
        replaceTaskDataToRow(row, task);
      });
    }
    tips[key] = `Updated to Row${rows.length > 1 ? 's: ' : ''} ${rows.join(', ')}`;
    highlightRows.push.apply(highlightRows, rows);
  });
  activateRows(highlightRows);
  return tips;
}

/**
 * updateTasks 的 JSON 版本，用于 GAS 接口调用
 * @param tasksJSON
 * @return {string}
 */
function updateTasksByJson(tasksJSON) {
  return JSON.stringify(updateTasks(JSON.parse(tasksJSON)));
}

/**
 * 更新一组 task 的 status，只更新 status 性能比 `updateTasks()` 高
 * @param {{[task: string]: string}} newTasksStatus TaskKey - status 键值对
 * @return {{[taskKey: string]: string}} 导入成功的提示语（每个 Task 分别有）
 */
function updateTasksStatus(newTasksStatus) {
  const tips = {};
  const highlightRows = [];
  const statusCol = _getStatusColumnNum();
  const keyList = _getTaskKeyList();
  const toBeUpdated = [];
  const updatedRows = {};
  const sheet = _getActiveSheet();
  const ranges = sheet.getActiveRangeList().getRanges();
  let minRow = 99999;
  let maxRow = 0;
  ranges.forEach(range => {
    const head = range.getRowIndex();
    const tail = range.getLastRow();
    if (head < minRow) { minRow = head; }
    if (maxRow < tail) { maxRow = tail; }
    for (let i = head; i <= tail; i ++) {
      const taskKey = keyList[i - 1];
      const status = newTasksStatus[taskKey];
      updatedRows[taskKey] = updatedRows[taskKey] || [];
      if (status) {
        toBeUpdated[i] = [status];
        updatedRows[taskKey].push(i);
        highlightRows.push(i);
      }
    }
  });
  if (minRow > maxRow) {
    return {};
  }
  const toBeUpdatedSliced = toBeUpdated.slice(minRow, maxRow + 1);
  const targetRange = sheet.getRange(minRow, statusCol + 1, maxRow - minRow + 1, 1);
  const originStatus = targetRange.getValues();
  for (let i = 0; i < originStatus.length; i++) {
    if (!toBeUpdatedSliced[i] || !toBeUpdatedSliced[i].length) {
      toBeUpdatedSliced[i] = originStatus[i];
    }
  }
  targetRange.setValues(toBeUpdatedSliced);
  Object.keys(updatedRows).forEach(taskKey => {
    if (taskKey) {
      const rows = updatedRows[taskKey];
      tips[taskKey] = `Updated to Row${rows.length > 1 ? 's: ' : ''} ${rows.join(', ')}`;
    }
  });
  activateRows(highlightRows);
  return tips;
}

/**
 * updateTasksStatus 的 JSON 版本，用于 GAS 接口
 * @param tasksJSON
 * @return {string}
 */
function updateTasksStatusByJson(tasksJSON) {
  return JSON.stringify(updateTasksStatus(JSON.parse(tasksJSON)));
}
