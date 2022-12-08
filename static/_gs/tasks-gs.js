

function formatDate(datetime) {
    if (!datetime) {
        return '';
    }

    return `${datetime.getFullYear()}-${datetime.getMonth() + 1}-${datetime.getDate()}T00:00:00Z`;
}

/**
 * Add task to my to do list
 * {title,notes,due}
 */
function addToMyTaskList() {
    const values = _getSelectedLineRowsAndValues().values;
    if (values.length <= 0) {
        return;
    }

    const list = values.reduce((pre, rows) => {
        const ls = rows.map((row) => {

            return {
                title: row[1],
                notes: `https://jira.domain.io/browse/${row[7]}`,
                due: formatDate(row[11]),
                links: [
                    {
                        "type": '',
                        "description": row[1],
                        "link": `https://jira.domain.io/browse/${row[7]}`
                    }
                ]
            }
        });
        return pre.concat(ls)
    }, [])

    const taskLists = Tasks.Tasklists.list();
    if (taskLists.items.length <= 0) {
        return;
    }
    const taskListId = taskLists.items[0].id;
    list.forEach((task) => {
        Tasks.Tasks.insert(task, taskListId);
    })
}
