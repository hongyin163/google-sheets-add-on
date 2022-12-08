/**
 * @file Google Workspace script server DEPRECATED functions
 * @description 这里的函数是开发过程中写了挺久的然后**废弃了的**然后觉得也许或者可能以后还有用的（然后舍不得删掉的）
 * 
 * @deprecated
 */

/**
 * 在某一行的下方插入一行数据
 * @param {number} row 行号，指定数据插入该行之下
 * @param {(string|null)[]} data
 * @param {string=} parentKey 若为subtask，此处有所属的上级 task key，否则空值
 * @deprecated
 */
function insertTaskDataAfterRow(row, data, parentKey) {
  const sheet = _getActiveSheet();
  sheet.insertRowsAfter(row, 1);
  replaceTaskDataToRow(row + 1, data, parentKey);
}

/**
 * 从jira获取一个task/subtask数据，表格中不存在则插入，存在则更新
 * @param {string} dataJson
 * @param {string=} parentKey
 * @param {'import'|'update'} mode
 * @return {string} 返回提示信息
 * @deprecated
 */
function importOrUpdateTask(dataJson, parentKey, mode) {
  const data = JSON.parse(dataJson);
  const col = _getKeyColumnNum();
  const taskKey = data[col];
  if (mode === 'import' && parentKey) {
    const parentRow = smartFindStartRowByParentKey(parentKey);
    if (parentRow > 0) {
      const row = _findTaskRowByKey(taskKey, parentRow);
      if (row > 0) {
        replaceTaskDataToRow(row, data, parentKey);
        return `Updated to Row ${row}`;
      } else {
        insertTaskDataAfterRow(parentRow, data, parentKey);
        return `Inserted after Row ${parentRow}`;
      }
    }
  }
  const rows = _findTaskAllRowsByKey(taskKey);
  if (rows.length > 0) {
    rows.forEach(row => replaceTaskDataToRow(row, data));
    return `Updated to Row${rows.length > 1 ? 's: ' : ''} ${rows.join(', ')}`;
  }

  const sheet = _getActiveSheet();
  const lastRow = sheet.getLastRow();
  insertTaskDataAfterRow(lastRow, data, parentKey);
  return `Add to the end`;
}

/**
 * 从jira获取的task/subtask数据，推测应该插入还是更新，表格中不存在则插入，存在则更新（不会实际插入或更新）
 * @param {(string | number | null)[]} data
 * @param {string=} parentKey
 * @param {'import'|'update'} mode
 * @return {{action: ('insert' | 'update' | 'add'), rows: number[], data: (string | number | null)[], key: string, parentKey: string}} 返回提示信息
 * @deprecated
 */
function inferTaskShouldBeInsertOrUpdate(data, parentKey, mode) {
  const col = _getKeyColumnNum();
  const taskKey = data[col];
  if (mode === 'import' && parentKey) {
    const parentRow = smartFindStartRowByParentKey(parentKey);
    if (parentRow > 0) {
      const row = _findTaskRowByKey(taskKey, parentRow);
      if (row > 0) {
        return {
          action: 'update',
          rows: [row],
          data,
          key: taskKey,
          parentKey,
        }
      } else {
        // insertTaskDataAfterRow(parentRow, data, parentKey);
        return {
          action: 'insert',
          rows: [parentRow],
          data,
          key: taskKey,
          parentKey,
        }
      }
    }
  }
  const rows = _findTaskAllRowsByKey(taskKey);
  if (rows.length > 0) {
    return {
      action: 'update',
      rows,
      data,
      key: taskKey,
      parentKey,
    };
  }

  const sheet = _getActiveSheet();
  const lastRow = sheet.getLastRow();
  return {
    action: 'add',
    rows: [lastRow],
    data,
    key: taskKey,
    parentKey,
  };
}

/**
 * 智能寻找所需的 parentKey 所在行
 * @param {string} parentKey
 * @return {number}
 * @deprecated
 */
function smartFindStartRowByParentKey(parentKey) {
  const sheet = _getActiveSheet();
  const rowA1 = _filterA1NotationRows(_getSelectedA1Notations());
  const rangeList = sheet.getRangeList(rowA1);
  const activeRanges = rangeList.getRanges();
  // rangeList.activate();
  let startFromRow = 0
  let startFromRange = null;
  let foundRow = 0
  let foundRange = null
  activeRanges.forEach(range => {
    let finder = range.createTextFinder(parentKey);
    while (foundRow >= 0) {
      foundRange = finder.findNext();
      if (foundRange) {
        foundRow = foundRange.getRow();
        if (startFromRow < foundRow) {
          startFromRow = foundRow;
          startFromRange = foundRange;
        }
      } else {
        foundRow = -1;
      }
    }
  })
  if (startFromRow > 0) {
    // startFromRange.activate();
    return startFromRow;
  }
  return _findLastTaskRowByKey(parentKey);
}