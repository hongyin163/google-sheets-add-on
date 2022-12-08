/**
 * @file GAS for complete tasks by task-key from jira
 * @description 补全 task 信息填入表格
 * 
 */

/**
 * 更新一波 tasks
 * @param {{rows: string[], values: (string | number | null)[][][]}, keyIndex: number} rowsAndValues
 */
function completeTask(rowsAndValues) {
  const { rows, values, keyIndex } = rowsAndValues;
  const sheet = _getActiveSheet();
  const ranges = sheet.getRangeList(rows).getRanges();
  ranges.forEach((range, index) => {
    range.setValues(values[index]);
  });
  // 为 task-key 创建链接
  const keyCol = _columnNum2letter(keyIndex);
  const keyRows = rows.map((row) =>
    `${keyCol}${row.replace(/[A-Z]/g, '')}`.replace(':', `:${keyCol}`)
  );
  const keyValues = values.map((rangeValue) =>
    rangeValue.map((rangeRow) => [rangeRow[keyIndex]])
  );
  const keyValuesWithLink = keyValues.map((rangeValue) =>
    rangeValue.map((rangeRow) => {
      const key = rangeRow[0];
      if (key) {
        return [_cellWithJiraLink(key)];
      }
      return [SpreadsheetApp.newRichTextValue().build()];
    })
  );
  const keyRanges = sheet.getRangeList(keyRows).getRanges();
  keyRanges.forEach((range, index) => {
    range.setRichTextValues(keyValuesWithLink[index]);
  })
}
