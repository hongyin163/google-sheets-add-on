
function testGetHiddenStatus() {
  const sheet = SpreadsheetApp.getActiveSheet();
  Logger.log(sheet.isRowHiddenByUser(5))
}

function testActivate() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getRange('111:115');
  range.activate();
}

function testRemoveHiddenRow() {
  Logger.log(_removeHiddenRowInA1(_getSelectedA1Notations()[0]));
}

function testCombineRowNumber() {
  Logger.log(_combineRowNumber([3,5,6,7,9]));
}
