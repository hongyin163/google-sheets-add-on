/**
 * @file
 * 
 */

import React, { useState } from 'react'
import TaskList from '../../../_share/components/TaskList'
import withJiraStatusCheck from '../../../_share/components/CheckJiraStatus'


function UpdateTaskFromJira() {
  const [jql, setJql] = useState<string>('')

  return (
    <TaskList
      isFullPage
      jql={jql}
      onJqlChangeByUser={j => setJql(j)}
      onTaskKeyListChange={taskKeyList => {
        setJql(`key in (${taskKeyList.map(k => `"${k}"`).join(',')})`)
      }}
      okButtonText="ADD TO MY TASKS"
      onOk={(checkedTasksList) => (new Promise((resolve, reject) => {
        const taskStatus: { [key: string]: string } = {};
        checkedTasksList.forEach((task) => {
          taskStatus[task.key] = task.fields.status.name;
        });
      
        const taskList = checkedTasksList.map((task) => {
          return {
            title: task.fields.summary,
            notes: task.fields.summary,
            due:task.fields.duedate
          }
        })
        console.log(taskList)
        google.script.run
          .withSuccessHandler((updateStatusHashJSON: string) => {
            const newUpdateStatusHash: { [taskKey: string]: string } = JSON.parse(updateStatusHashJSON)
            resolve(newUpdateStatusHash)
          })
          .withFailureHandler((error, object) => {
            console.error('update error: ', error, object)
            reject({
              error,
              object,
            })
          })
          .addToMyTaskList(JSON.stringify(taskList))
      }))}
    />
  )
}

export default withJiraStatusCheck(UpdateTaskFromJira, 'add-task-to-tasks')