/**
 * @file Google Workspace script server UTILS
 * @description 这里的函数都是**不会**向表格写入数据的，只会读表和计算
 * 
 * @private
 */

/**
 * 缓存一些表格数据，以减少表格的频繁读取
 * @type {{[key: string]: any}}
 * @private
 */
const __cache = {};

/**
 * Cached `SpreadsheetApp.getActiveSheet()`
 * @return {Sheet}
 * @private
 */
function _getActiveSheet() {
  __cache.activeSheet = __cache.activeSheet || SpreadsheetApp.getActiveSheet();
  return __cache.activeSheet;
}

/**
 * isRowHiddenByUser(row) 检查一行是否被隐藏或被折叠
 * @param {number} row
 * @return {boolean}
 * @private
 */
function _isRowHiddenByUser(row) {
  __cache.isRowHidden = __cache.isRowHidden || {};
  if (typeof __cache.isRowHidden[`${row}`] === 'undefined') {
    __cache.isRowHidden[`${row}`] = _getActiveSheet().isRowHiddenByUser(row);
  }
  return __cache.isRowHidden[`${row}`];
}

function _getFirstRow() {
  if (__cache.firstRow) {
    return __cache.firstRow;
  }
  const sheet = _getActiveSheet();
  const firstRow = sheet.getRange('A1:Z1').getValues()[0];
  __cache.firstRow = firstRow;
  return firstRow;
}

/**
 * 根据正则表达式获取列的索引
 * @param {Regex} regexp 
 * @returns 
 */
function _getColumnNumByRegexp(regexp) {
  const firstRow = _getFirstRow();
  const textReg =new RegExp(regexp);

  return firstRow.reduce((c, v, i) => (textReg.test(v) ? i : c), -1);
}

/**
 * 通过第1行的字符串确定哪一列是 Task / Subtask (列号码从0开始)
 * @return {number}
 * @private
 */
function _getKeyColumnNum() {
  if (__cache.keyColumnNum) {
    return __cache.keyColumnNum;
  }
  const firstRow = _getFirstRow();
  const textReg = /Task(.|\n)*(Sub.*task){0,1}/i;

  __cache.keyColumnNum = firstRow.reduce((c, v, i) => (textReg.test(v) ? i : c), -1);
  return __cache.keyColumnNum;
}

/**
 * 通过第1行的字符串确定哪一列是 Status (列号码从0开始)
 * @return {number}
 * @private
 */
function _getStatusColumnNum() {
  if (__cache.statusColumnNum) {
    return __cache.statusColumnNum;
  }
  const sheet = _getActiveSheet();
  const firstRow = sheet.getRange('1:1');
  const finder = firstRow.createTextFinder('^status$').matchCase(false).useRegularExpression(true);
  const range = finder.findNext();
  if (!range) return -1;
  __cache.statusColumnNum = range.getColumn() - 1;
  return __cache.statusColumnNum;
}

/**
 * 通过第1行的字符串确定哪一列是 Summary (列号码从0开始)
 * @return {number}
 * @private
 */
function _getSummaryColumnNum() {
  if (__cache.summaryColumnNum) {
    return __cache.summaryColumnNum;
  }
  const sheet = _getActiveSheet();
  const firstRow = sheet.getRange('1:1');
  const finder = firstRow.createTextFinder('^topic name|^summary').matchCase(false).useRegularExpression(true);
  const range = finder.findNext();
  if (!range) {
    return -1;
  }
  __cache.summaryColumnNum = range.getColumn() - 1;
  return __cache.summaryColumnNum;
}

/**
 * 通过第1行的字符串确定哪一列是 Bug Unsolved (列号码从0开始)
 * @return {number}
 * @private
 */
function _getBugUnsolvedColumnNum() {
  if (__cache.bugUnsolvedColumnNum) {
    return __cache.bugUnsolvedColumnNum;
  }
  const firstRow = _getFirstRow();
  const textReg = /bug.+un(re)?solve/i;
  __cache.bugUnsolvedColumnNum = firstRow.reduce((c, v, i) => (textReg.test(v) ? i : c), -1);
  return __cache.bugUnsolvedColumnNum;
}
/**
 * 通过第1行的字符串确定哪一列是 Bug Total (列号码从0开始)
 * @return {number}
 * @private
 */
function _getBugTotalColumnNum() {
  if (__cache.bugTotalColumnNum) {
    return __cache.bugTotalColumnNum;
  }
  const firstRow = _getFirstRow();
  const textReg = /bug.+total/i;
  __cache.bugTotalColumnNum = firstRow.reduce((c, v, i) => (textReg.test(v) ? i : c), -1);
  return __cache.bugTotalColumnNum;
}

/**
 * 把列号码转成字母，如 7=>H （从0开始计算以方便数组操作）
 * @param {number} n
 * @return {string}
 * @private
 */
function _columnNum2letter(n) {
  return String.fromCharCode('A'.charCodeAt(0) + n);
}

/**
 * 把字母转成列号，如 H=>7 （从0开始计算以方便数组操作）
 * @param {string} l
 * @return {number}
 * @private
 */
function _letter2columnNum(l) {
  return l.charCodeAt(0) - 'A'.charCodeAt(0);
}

/**
 * 获取当前选中的行、列标识符，例如 ["D1", "A2:C5", "E:E", "6:6"]
 * @returns {string[]}
 * @private
 */
function _getSelectedA1Notations() {
  if (__cache.selectedA1Notations) {
    return __cache.selectedA1Notations;
  }
  const sheet = _getActiveSheet();
  const ranges = sheet.getActiveRangeList().getRanges();
  __cache.selectedA1Notations = ranges.map(function (v) {
    return v.getA1Notation();
  });
  return __cache.selectedA1Notations;
}

/**
 * 把多个范围标识扩展到整行。["B2:D5", "A3"] => ["2:5", "3:3"]
 * @param {string[]} notationArray
 * @return {string[]}
 * @private
 */
function _filterA1NotationRows(notationArray) {
  return notationArray.map(function (n) {
    return _filterA1NotationRow(n);
  })
}

const MAX_COLUMN_ALPHABET = 'Z';

/**
 * 把一个范围标识扩展到整行。"B2:D5" => "2:5"
 * @param {string} notation
 * @return {string}
 * @private
 */
function _filterA1NotationRow(notation) {
  let r = notation.replace(/[A-Z]/g, '');
  if (r.indexOf(':') < 0) {
    r = MAX_COLUMN_ALPHABET ? `A${r}:${MAX_COLUMN_ALPHABET}${r}` : `${r}:${r}`;
  } else {
    r = `A${r}`.replace(':', `:${MAX_COLUMN_ALPHABET}`);
  }
  return r;
}

/**
 * 获取 filterA1NotationRows(getSelectedA1Notations()) 并缓存之
 * @returns {string[]}
 * @private
 */
function _getFilteredSelectedA1Notations() {
  __cache.filteredSelectedA1Notations = __cache.filteredSelectedA1Notations || _filterA1NotationRows(_getSelectedA1Notations());
  return __cache.filteredSelectedA1Notations;
}

/**
 * 给 _getFilteredSelectedA1Notations() 过滤掉隐藏的行 并缓存之
 * @returns {string[]}
 * @private
 */
function _getNotHiddenFilteredSelectedA1Notations() {
  if (__cache.notHiddenFilteredSelectedA1Notations) {
    return __cache.notHiddenFilteredSelectedA1Notations;
  }
  let a = [];
  _getFilteredSelectedA1Notations().forEach(a1 => {
    a = a.concat(_removeHiddenRowInA1(a1));
  });
  __cache.notHiddenFilteredSelectedA1Notations = a;
  return a;
}

/**
 * 把一个单元格标识拆成行号和列字母
 * @param {string} notation
 * @return {[string, number]}
 * @private
 */
function _splitA1XY(notation) {
  const reg = /^([A-Z]*)([0-9]*)$/;
  if (!notation || !reg.test(notation)) {
    return ['', 0];
  }
  const match = reg.exec(notation);
  return [match[1] || '', parseInt(match[2], 10) || 0];
}

/**
 * 把一个标识内被隐藏或折叠的行去掉。"2:9" => ["2:5", "9:9"]
 * @param {string} a1
 * @return {string[]}
 * @private
 */
function _removeHiddenRowInA1(a1) {
  let [left, right] = a1.split(':');
  if (!right) {
    right = left;
  }
  const [leftCol, leftRow] = _splitA1XY(left);
  const [rightCol, rightRow] = _splitA1XY(right);
  let res = [];
  let curRow = leftRow;
  while (curRow <= rightRow && !_isRowHiddenByUser(curRow)) {
    curRow += 1;
  }
  let nextRow = curRow;
  while (nextRow <= rightRow && _isRowHiddenByUser(nextRow)) {
    nextRow += 1;
  }
  if (curRow !== leftRow) {
    res.push(`${leftCol}${leftRow}:${rightCol}${curRow - 1}`);
  }
  if (nextRow <= rightRow) {
    res = res.concat(_removeHiddenRowInA1(`${leftCol}${nextRow}:${rightCol}${rightRow}`));
  }
  return res;
}

/**
 * 使 cache 中的 taskKeyList 和 taskKeyHash 同步
 * @private
 */
function _updateTaskKeyHashCache() {
  const list = __cache.taskKeyList || [];
  const hash = {};
  list.forEach((taskKey, i) => {
    if (hash[taskKey]) {
      hash[taskKey].push(i);
    } else {
      hash[taskKey] = [i];
    }
  });
  __cache.taskKeyHash = hash;
}

/**
 * 获取并缓存整张表格中每一行的 taskKey 值，以减少表格查询次数
 * @return {string[]}
 * @private
 */
function _getTaskKeyList() {
  if (!__cache.taskKeyList) {
    const taskColumnLetter = _columnNum2letter(_getKeyColumnNum());
    const sheet = _getActiveSheet();
    const taskColumn = sheet.getRange(`${taskColumnLetter}:${taskColumnLetter}`);
    __cache.taskKeyList = taskColumn.getValues().map(v => (v[0] || ''));
    _updateTaskKeyHashCache();
  }
  return __cache.taskKeyList;
}

/**
 * 获得整张表格的 taskKey - 行号 键值对，方便根据 taskKey 查询行号（每个键值可能有重复的行，所以值为数组 number[]）
 * @return {{[taskKey: string]: number[]}}
 * @private
 */
function _getTaskKeyHash() {
  if (!__cache.taskKeyHash) {
    _getTaskKeyList();
  }
  return __cache.taskKeyHash;
}

/**
 * 根据 Task key 找到相应的行
 * @param {string} key
 * @param {number=} startFromRow
 * @return {number}
 * @private
 */
function _findTaskRowByKey(key, startFromRow) {
  const hash = _getTaskKeyHash();
  if (!hash[key] || !hash[key].length) {
    return -1;
  }
  return hash[key].find(v => v >= (startFromRow || 0) - 1) + 1;
}

/**
 * 根据 Task key 找到相应的行（从下往上查找）
 * @param {string} key
 * @return {number}
 * @private
 */
function _findLastTaskRowByKey(key) {
  const hash = _getTaskKeyHash();
  if (!hash[key] || !hash[key].length) {
    return -1;
  }
  return hash[key][hash[key].length - 1] + 1;
}

/**
 * 从A1格式的范围内寻找 key 所在行
 * @param {string} key
 * @param {string[]} a1RangeList ['2:3', '5:29', '33:89"]
 * @return {number[]}
 * @private
 */
function _findTaskRowInA1RangeList(key, a1RangeList) {
  const hash = _getTaskKeyHash();
  if (!hash[key] || !hash[key].length) {
    return [];
  }
  const rows = hash[key];
  const rangeList = a1RangeList.map(r => r.split(':').map(r2 => parseInt(r2.replace(/[A-Za-z]+/i, ''), 10) - 1));
  return rows.filter(row =>
    typeof rangeList.find(([head, tail]) => (head <= row && row <= tail)) !== 'undefined'
  );
}

/**
 * 根据 Task key 找到所有（重复的）相应的行
 * @param {string} key
 * @return {number[]}
 * @private
 */
function _findTaskAllRowsByKey(key) {
  return _getTaskKeyHash()[key];
}

/**
 * 为 task key 创建链接
 * @param {string} key
 * @return {RichTextValue}
 * @private
 */
function _cellWithJiraLink(key) {
  return SpreadsheetApp.newRichTextValue().setText(key).setLinkUrl(`https://jira.domain.io/browse/${key}`).build();
}

/**
 * 组合相邻的行号，[5, 6, 7, 10] => ["5:7", "10:10"]
 * @param {number[]} rows
 * @return {string[]}
 * @private
 */
function _combineRowNumber(rows) {
  const _rows = [...rows].sort();
  const res = [];
  let p1 = 0, p2 = 1;
  const len = _rows.length;
  while (p2 < len) {
    if (_rows[p2 - 1] + 1 !== _rows[p2]) {
      res.push(`${_rows[p1]}:${_rows[p2 - 1]}`);
      p1 = p2;
    }
    p2++;
  }
  res.push(`${_rows[p1]}:${_rows[p2 - 1]}`);
  return res;
}
