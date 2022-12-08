/**
 * @file
 * 
 */

import React, { useState } from 'react'
import TaskList from '../../../_share/components/TaskList'
import withJiraStatusCheck from '../../../_share/components/CheckJiraStatus'
// import { COLUMN_CONFIG } from '../../../_share/config/field-config'

// const updateColumnConfig = COLUMN_CONFIG.map(c => {
//   if (
//     c.field !== 'fields.status.name' &&
//     c.field !== 'key' /*&&
//     c.field !== 'fields.summary'*/
//   ) {
//     return {
//       key: c.key,
//       value: c.value,
//     }
//   }
//   return c
// })

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
      okButtonText="UPDATE"
      onOk={(checkedTasksList) => (new Promise((resolve, reject) => {
        const taskStatus: {[key: string]: string} = {};
        checkedTasksList.forEach((task) => {
          taskStatus[task.key] = task.fields.status.name;
        });
        console.log(taskStatus)
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
          .updateTasksStatusByJson(JSON.stringify(taskStatus))
      }))}
    />
  )
}

export default withJiraStatusCheck(UpdateTaskFromJira,'update-task-from-jira')