function onOpen() {
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
    .createMenu('Jira Tool')
    .addItem('Import subtasks from Jira', 'showImport')
    .addItem('Update task info from Jira', 'showUpdate')
    .addItem('Update task info to Jira', 'showUpdateToJira')
    .addItem('Create task from epic', 'showCreateTaskFromEpic')
    .addSeparator()
    .addItem('Import subtasks by account', 'showImportSubtasksByAccount')
    .addItem('Update taskscore to jira', 'showUpdateTaskscoreToJira')
    .addItem('Add task to my Tasks', 'showAddTaskToMyTasks')
    .addSeparator()
    .addItem('Login Jira', 'showSettingDialog')
    .addItem('About', 'showAboutDialog')
    .addToUi();
}

function showSettingDialog() {
  var html = HtmlService.createHtmlOutputFromFile('setting')
    .setWidth(400)
    .setHeight(240);
  SpreadsheetApp.getUi()
    .showModalDialog(html, 'Login');
}

function showImport() {
  var html = HtmlService.createHtmlOutputFromFile('import-task-from-jira')
    .setTitle('Import from jira');
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
    .showSidebar(html);
}

function showUpdate() {
  var html = HtmlService.createHtmlOutputFromFile('update-task-from-jira')
    .setTitle('Update from jira');
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
    .showSidebar(html);
}

function showUpdateBugInfo() {
  var html = HtmlService.createHtmlOutputFromFile('update-bug-info-from-jira')
    .setTitle('Update bug info from jira');
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
    .showSidebar(html);
}

function showUpdateToJira() {
  var html = HtmlService.createHtmlOutputFromFile('update-task-to-jira')
    .setTitle('Update to jira');
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
    .showSidebar(html);
}

function showImportSubtasksByAccount() {
  var html = HtmlService.createHtmlOutputFromFile('import-taskscore-from-jira')
    .setTitle('Import subtasks by email');
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
    .showSidebar(html);
}

function showUpdateTaskscoreToJira() {
  var html = HtmlService.createHtmlOutputFromFile('update-taskscore-to-jira')
    .setTitle('Update taskscore to jira');
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
    .showSidebar(html);
}


function showCreateTaskFromEpic() {
  var html = HtmlService.createHtmlOutputFromFile('create-task-from-epic')
    .setTitle('Create task from epic');
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
    .showSidebar(html);
}

function showAboutDialog() {
  var html = HtmlService.createHtmlOutputFromFile('about')
    .setWidth(800)
    .setHeight(360);
  SpreadsheetApp.getUi()
    .showModalDialog(html, 'Target File Assistant');
}

function showWeeklyReportGenerator() {
  var html = HtmlService.createHtmlOutputFromFile('generate-weekly-report')
    .setTitle('Generate weekly report')
    .setWidth(1200)
    .setHeight(900);
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
    .showModalDialog(html, 'Weekly Report Generator');
}

function showCompleteTaskDialog() {
  const html = HtmlService.createHtmlOutputFromFile('complete-task')
    .setWidth(400)
    .setHeight(350);
  SpreadsheetApp.getUi()
    .showModalDialog(html, 'Complete Task Info');
}

function showAddTaskToMyTasks() {
  const html = HtmlService.createHtmlOutputFromFile('add-task-to-tasks')
    .setWidth(400)
    .setHeight(350);
  SpreadsheetApp.getUi()
    .showModalDialog(html, 'Add tasks to my Tasks');
}

function showCompleteEpicDialog() {
  const html = HtmlService.createHtmlOutputFromFile('complete-epic')
    .setWidth(400)
    .setHeight(350);
  SpreadsheetApp.getUi()
    .showModalDialog(html, 'Complete Epic Info');
}

function showFilterTaskByLabels() {
  var html = HtmlService.createHtmlOutputFromFile('filter-by-labels')
    .setTitle('Filter by labels');
  SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
    .showSidebar(html);
}

