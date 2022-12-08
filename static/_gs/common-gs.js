/**
 * @file Google Workspace script server common APIs
 * @description 这里的函数可能给好几个功能调用，给页面读取或写入表格（然后与jira互动）
 * 
 * @public
 */


/**
 * 是否在獲取所選行的時候過濾掉隱藏行（慢）
 * @type {boolean}
 */
const SELECTED_LINE_FILTER_HIDDEN_ROW = false;

/**
 * 获取当前选中的行的所有值，返回三维数组，下标分别为Range,row,column，同时返回选中的行
 * @example r[2][3][5] 表示第2个区域的第3行第5列（可以使用Ctrl/Command键同时选中多个区域）
 * @return {rows: string[], values: string[][][]}
 */
function _getSelectedLineRowsAndValues() {
  const sheet = _getActiveSheet();
  const rowA1 = _filterA1NotationRows(_getSelectedA1Notations());
  let rowA1Filtered = [];
  if (SELECTED_LINE_FILTER_HIDDEN_ROW) {
    rowA1.forEach((a1) => {
      rowA1Filtered = rowA1Filtered.concat(_removeHiddenRowInA1(a1));
    });
  } else {
    rowA1Filtered = rowA1;
  }
  const rangeList = sheet.getRangeList(rowA1Filtered);
  const res = rangeList.getRanges();
  rangeList.activate();
  const resValues = res.map(function (r) {
    return r.getValues();
  });
  return {
    rows: rowA1Filtered,
    values: resValues,
  };
}

/**
 * 获取当前选中的行的所有值，返回三维数组，下标分别为Range,row,column
 * @example r[2][3][5] 表示第2个区域的第3行第5列（可以使用Ctrl/Command键同时选中多个区域）
 * @return {string} JSON.stringify<string[][][]>
 */
function getSelectedLineValues() {
  return JSON.stringify(_getSelectedLineRowsAndValues().values);
}

/**
 * 获取当前选中的行的所有值，返回三维数组，下标分别为Range,row,column，同时返回选中的行
 * @example r[2][3][5] 表示第2个区域的第3行第5列（可以使用Ctrl/Command键同时选中多个区域）
 * @return {string} JSON.stringify<{rows: string[], values: string[][][]}>
 */
function getSelectedLineRowsAndValues() {
  return JSON.stringify(_getSelectedLineRowsAndValues());
}


function getSelectedLineTaskKeys() {

}

/**
 * 插入多行数据并取消summary加粗，并加task链接
 * @param {number} row 行号，指定数据插入该行之下
 * @param {(string|null)[][]} dataArray
 */
function insertTaskDataArrayAfterRow(row, dataArray) {
  const newRowNum = dataArray.length;
  if (!newRowNum) {
    return;
  }
  const newRange = insertDataArrayAfterRow(row, dataArray);

  const taskColumn = _getKeyColumnNum();
  const summaryColumn = _getSummaryColumnNum();

  if (summaryColumn !== -1) {
    const summaryTextStyle = SpreadsheetApp.newTextStyle().setForegroundColor('#666').setBold(false).build();
    newRange.offset(0, summaryColumn, newRowNum, 1).activate().setTextStyle(summaryTextStyle);
  }

  if (taskColumn !== -1) {
    const taskKeysWithLink = dataArray.map(data => [(data[taskColumn] ? _cellWithJiraLink(data[taskColumn]) : '')]);
    newRange.offset(0, taskColumn, newRowNum, 1).activate().setRichTextValues(taskKeysWithLink);
  }

}
/**
 * 在某一行的下方插入多行数据
 * @param {number} row 行号，指定数据插入该行之下
 * @param {(string|null)[][]} dataArray
 */
function insertDataArrayAfterRow(row, dataArray) {
  const newRowNum = dataArray.length;
  if (!newRowNum) {
    return;
  }
  const newColNum = dataArray[0].length;
  const sheet = _getActiveSheet();
  sheet.insertRowsAfter(row, newRowNum);
  const newRange = sheet.getRange(`A${row + 1}:${_columnNum2letter(newColNum - 1)}${row + newRowNum}`);
  newRange.activate().setValues(dataArray);
  return newRange;
}

/**
 * 更新（覆盖）某一行数据，并且
 *  【取消】1. 对于 Task 的 Summary 字体加粗，对于 Subtask 的 Summary 字体取消加粗
 *  2. 给 Task key 加链接
 *  3. 参数 data 某个值若为空，则跳过此单元格，避免以空值覆盖
 * @param {number} row 行号，指定数据插入该行之下
 * @param {(string|number|null)[]} data
 * @param {string=} parentKey 若为subtask，此处有所属的上级 task key，否则空值
 */
function replaceTaskDataToRow(row, data, parentKey) {
  const sheet = _getActiveSheet();
  const targetRange = sheet.getRange(row, 1, 1, data.length);
  const oldValues = targetRange.getValues();
  const newValues = oldValues[0];
  const taskColumn = _getKeyColumnNum();
  if (data && data.length) {
    data.forEach((v, i) => {
      if (!v || v === 'null') {
        return;
      }
      if (v) {
        newValues[i] = v;
      }
    });
    targetRange.activate();
    targetRange.setValues([newValues]);
    if (data[taskColumn]) {
      targetRange.getCell(1, taskColumn + 1).setRichTextValue(_cellWithJiraLink(data[taskColumn]));
    }
  }
}


/**
 * 选中一行（用于高亮展示）
 * @param {number} row
 * @param {number|string=} columnNumber
 */
function activateRow(row, columnNumber) {
  const sheet = _getActiveSheet();
  const col = typeof columnNumber === 'number' ? _columnNum2letter(columnNumber) : (columnNumber || 'Z');
  const range = sheet.getRange(`A${row}:${col}${row}`);
  range.activate();
}
/**
 * 选中几行（用于高亮展示）
 * @param {number[]} rows
 * @param {number|string=} columnNumber
 */
function activateRows(rows, columnNumber) {
  const sheet = _getActiveSheet();
  const reg = /(\d+):(\d+)/;
  const col = typeof columnNumber === 'number' ? _columnNum2letter(columnNumber) : (columnNumber || 'Z');
  const rangeList = sheet.getRangeList(_combineRowNumber(rows).map(rowA1 => rowA1.replace(reg, `A$1:${col}$2`)));
  rangeList.activate();
}

/**
 * activateRows 的 JSON 版本
 * @param {string} rowsJson
 */
function activateRowsByJson(rowsJson) {
  activateRows(JSON.parse(rowsJson))
}

function showSuccessToast(msg) {
  SpreadsheetApp.getActiveSpreadsheet().toast(msg || 'Import tasks SUCCESS.');
}

