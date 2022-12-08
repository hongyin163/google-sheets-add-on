
const LOGIN_BUTTON = {
    text: "Login Jira",
    desc: "Log in Jira system using your username and password, if you don't have one, please register first.",
    action: "showSettingDialog",
    registTest: 'Regist Jira',
    registLink: 'https://jira.domain.io/login.jsp?os_destination=%2Fdefault.jsp'
};
const BUTTONS = [
    {
        text: "Import Subtasks from Jira",
        desc: "Select a task and import subtasks of this task",
        action: "showImport"
    }, {
        text: "Update Task Status from Jira",
        desc: "Select multiple tasks and then update the status of these tasks",
        action: "showUpdate"
    }, {
        text: "Complete Task info",
        desc: "Select multiple tasks and then complete or update the information of these tasks",
        action: "showCompleteTaskDialog"
    }, {
        text: "Complete Epic info",
        desc: "You can select multiple epics and then complete or update the information of these epics",
        action: "showCompleteEpicDialog"
    }, {
        text: "Update Task info to Jira",
        desc: "Select multiple tasks and then update storypoint、duedate and startdate to Jira",
        action: "showUpdateToJira"
    }, {
        text: "Update Bug Info from JIRA",
        desc: "Select task(s) and then check bugs that is blocked by the task(s), and update the number of bugs unsolved and total",
        action: "showUpdateBugInfo"
    },
    {
        text: "Import subtasks by account",
        desc: "Import subtasks by account for compute task score.",
        action: "showImportSubtasksByAccount"
    }, {
        text: "Update taskscore to Jira",
        desc: "Select multiple subtasks and update task score to Jira",
        action: "showUpdateTaskscoreToJira"
    }, {

        text: "Filter by Labels",
        desc: "Filter tasks by labels in topic",
        action: "showFilterTaskByLabels"
    }, {

        text: "Add task to Tasks",
        desc: "Add task to my google Tasks",
        action: "showAddTaskToMyTasks"
    }, {
        text: "Weekly Report Helper",
        desc: "Generate, copy and send weekly report",
        action: "showWeeklyReportGenerator"
    },
    {
        text: "About",
        desc: "",
        action: "showAboutDialog",
        style: CardService.TextButtonStyle.TEXT
    }]
/**
 * Callback for rendering the main card.
 * @return {CardService.Card} The card to show the user.
 */
function onHomepage(e) {
    return buildCard();
}


function buildCard() {
    var builder = CardService.newCardBuilder();
    builder = buildLoginSection(builder);
    builder = buildButtonsSection(builder);
    return builder.build();
}

function buildLoginSection(builder) {

    return builder.addSection(CardService.newCardSection()
        .addWidget(CardService.newButtonSet()
            .addButton(CardService.newTextButton()
                .setText(LOGIN_BUTTON.text)
                .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
                .setOnClickAction(CardService.newAction().setFunctionName(LOGIN_BUTTON.action))
                .setDisabled(false))
            .addButton(CardService.newTextButton()
                .setText(LOGIN_BUTTON.registTest)
                .setOpenLink(CardService.newOpenLink()
                    .setUrl(LOGIN_BUTTON.registLink)
                    .setOpenAs(CardService.OpenAs.FULL_SIZE)
                    .setOnClose(CardService.OnClose.RELOAD_ADD_ON))
            )
        )
        .addWidget(CardService.newTextParagraph()
            .setText(LOGIN_BUTTON.desc))
    )

}

function buildButtonsSection(builder) {
    BUTTONS.forEach((button) => {
        builder.addSection(buildButton(button))
    })
    return builder;
}

function buildButton({ text, desc, action, style }) {
    return CardService.newCardSection()
        .addWidget(CardService.newTextButton()
            .setText(text)
            .setTextButtonStyle(style || CardService.TextButtonStyle.FILLED)
            .setOnClickAction(CardService.newAction().setFunctionName(action))
        )
        .addWidget(CardService.newTextParagraph()
            .setText(desc))
}