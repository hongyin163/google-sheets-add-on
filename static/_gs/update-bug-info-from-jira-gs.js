
/**
 * 更新一组 task 的 bug 数
 * @param {{[task: string]: { bugUnsolved: number, bugTotal: number }}} newBugInfo TaskKey - {bugUnsolved, bugTotal} 键值对
 * @return {{[taskKey: string]: string}} 导入成功的提示语（每个 Task 分别有）
 */
function updateBugInfo(newBugInfo) {
  const tips = {};
  const highlightRows = [];
  const bugUnsolvedCol = _getBugUnsolvedColumnNum();
  const bugTotalCol = _getBugTotalColumnNum();
  const keyList = _getTaskKeyList();
  const bugUnsolvedToBeUpdated = [];
  const bugTotalToBeUpdated = [];
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
      if (!newBugInfo[taskKey]) { continue; }
      const { bugUnsolved, bugTotal } = newBugInfo[taskKey];
      updatedRows[taskKey] = updatedRows[taskKey] || [];
      if (bugUnsolved >= 0 || bugTotal >= 0) {
        if (bugUnsolved >= 0) {
          bugUnsolvedToBeUpdated[i] = [bugUnsolved];
        }
        if (bugTotal >= 0) {
          bugTotalToBeUpdated[i] = [bugTotal];
        }
        updatedRows[taskKey].push(i);
        highlightRows.push(i);
      }
    }
  });
  if (minRow > maxRow) {
    return {};
  }
  const bugUnsolvedToBeUpdatedSliced = bugUnsolvedToBeUpdated.slice(minRow, maxRow + 1);
  const bugTotalToBeUpdatedSliced = bugTotalToBeUpdated.slice(minRow, maxRow + 1);
  const bugUnsolvedTargetRange = sheet.getRange(minRow, bugUnsolvedCol + 1, maxRow - minRow + 1, 1);
  const bugTotalTargetRange = sheet.getRange(minRow, bugTotalCol + 1, maxRow - minRow + 1, 1);
  const bugUnsolvedOriginStatus = bugUnsolvedTargetRange.getValues();
  for (let i = 0; i < bugUnsolvedOriginStatus.length; i++) {
    if (!bugUnsolvedToBeUpdatedSliced[i] || !bugUnsolvedToBeUpdatedSliced[i].length) {
      bugUnsolvedToBeUpdatedSliced[i] = bugUnsolvedOriginStatus[i];
    }
  }
  bugUnsolvedTargetRange.setValues(bugUnsolvedToBeUpdatedSliced);
  const bugTotalOriginStatus = bugUnsolvedTargetRange.getValues();
  for (let i = 0; i < bugTotalOriginStatus.length; i++) {
    if (!bugTotalToBeUpdatedSliced[i] || !bugTotalToBeUpdatedSliced[i].length) {
      bugTotalToBeUpdatedSliced[i] = bugTotalOriginStatus[i];
    }
  }
  bugTotalTargetRange.setValues(bugTotalToBeUpdatedSliced);
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
 * updateBugInfo 的 JSON 版本，用于 GAS 接口
 * @param tasksJSON
 * @return {string}
 */
function updateBugInfoByJson(tasksJSON) {
  return JSON.stringify(updateBugInfo(JSON.parse(tasksJSON)));
}
