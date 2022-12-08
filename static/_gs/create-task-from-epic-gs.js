/**
 * @file Google Workspace script server APIs used in the create-task-from-epic page
 * 
 */

/**
 * 在epic下方插入对应task
 * @param {string} dataJson task数据
 * @param {string} parentKey epic的key
 * @return {string} 返回提示信息
 */
 function insertTaskUnderEpic(dataJson, parentKey) {
  const data = JSON.parse(dataJson);
  const parentRow = smartFindStartRowByParentKey(parentKey);
  const sheet = _getActiveSheet();
  sheet.insertRowsAfter(parentRow, 1); // 在parentRow下方插入一个空白行
  addTaskInfo(parentRow + 1, data, parentKey); // 在空白行中填入内容，并给Task key加链接
  return `Inserted after Row ${parentRow}`;
}

/**
 * 在空白行中填入内容，并给Task key加链接
 * (参数 data 某个值若为空，则跳过此单元格，避免以空值覆盖)
 * @param {number} row 行号，指定数据插入该行之下
 * @param {(string|null)[]} data
 * @param {string} parentKey 若为subtask，此处有所属的上级 task key，否则空值
 */
function addTaskInfo(row, data, parentKey) {
  const sheet = _getActiveSheet();
  const targetRange = sheet.getRange(row, 1, 1, data.length);
  const oldValues = targetRange.getValues();
  const newValues = oldValues[0];
  const taskColumn = _getKeyColumnNum();
  const summaryColumn = _getSummaryColumnNum();
  if (data && data.length) {
    data.forEach((v, i) => {
      if (!v || v === 'null') {
        return;
      }
      if (v) {
        newValues[i] = v;
      }
    });
    targetRange.setValues([newValues]);
    if (data[summaryColumn]) {
      const textStyle = SpreadsheetApp.newTextStyle().setBold(false).build();
      const richSummary = SpreadsheetApp.newRichTextValue().setText(data[summaryColumn]).setTextStyle(textStyle).build();
      targetRange.getCell(1, summaryColumn + 1).setRichTextValue(richSummary);
    }
    if (data[taskColumn]) {
      targetRange.getCell(1, taskColumn + 1).setRichTextValue(_cellWithJiraLink(data[taskColumn]));
    }
  }
}