/**
 * @file GAS for Import subtask from jira
 * @description 导入 subtask 填入表格
 * 
 */

/**
 * 导入按照 parent 分好组的 subtasks
 * @param {{[parentKey: string]: (string | number | null)[][]}} subtaskGroups
 * @return {{[taskKey: string]: string}} 导入成功的提示语（每个 Task 分别有）
 */
function importSubtaskGroups(subtaskGroups) {
  const parentKeyList = Object.keys(subtaskGroups);
  const insertPositions = {};
  const tips = {};
  const highlightRows = [];
  const col = _getKeyColumnNum();
  parentKeyList.forEach(parentKey => {
    const parentRows = _findTaskRowInA1RangeList(parentKey, _getNotHiddenFilteredSelectedA1Notations());
    const subtaskList = subtaskGroups[parentKey];
    if (parentRows.length) {
      parentRows.forEach(row => {
        insertPositions[row + 1] = subtaskList;
      });
    } else {
      subtaskList.forEach(subtask => {
        tips[subtask[col]] = `Cannot find parent task ${parentKey} in selected rows`;
      });
    }
  });

  const insertRows = Object.keys(insertPositions).map(r => parseInt(r, 10)).sort();
  let offset = 0;
  insertRows.forEach(insertRow => {
    const r = insertRow + offset;
    const subtaskList = insertPositions[insertRow];
    insertTaskDataArrayAfterRow(r, subtaskList);
    highlightRows.push(r);
    subtaskList.forEach((subtask, i) => {
      const key = subtask[col];
      tips[key] = (!tips[key] || tips[key].indexOf('Cannot') >= 0) ? `Inserted to Row ${r + i + 1}` :
        tips[key] + `, ${r + i + 1}`;
      highlightRows.push(r + i + 1);
    });
    offset += subtaskList.length;
  });
  if (highlightRows.length) {
    activateRows(highlightRows);
  }
  return tips;
}

/**
 * importSubtaskGroups 的 JSON 版本，用于 GAS 接口调用
 * @param {string} subtaskGroupsJSON
 * @return {string}
 */
function importSubtaskGroupsByJson(subtaskGroupsJSON) {
  return JSON.stringify(importSubtaskGroups(JSON.parse(subtaskGroupsJSON)));
}
