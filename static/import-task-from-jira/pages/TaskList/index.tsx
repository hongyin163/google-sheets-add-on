/**
 * @file
 * 
 */

import React, { useState } from 'react'
import TaskList from '../../../_share/components/TaskList'
import { groupAndSortByParentKey, isoDateToNormalizedDate, taskToDataArray } from '../../../_share/lib/util'
import withJiraStatusCheck from '../../../_share/components/CheckJiraStatus';
function ImportTaskFromJira() {
  const [jql, setJql] = useState<string>('')

  return (
    <TaskList
      isFullPage
      jql={jql}
      onJqlChangeByUser={j => setJql(j)}
      onTaskKeyListChange={taskKeyList => {
        setJql(`parent in (${taskKeyList.map(k => `"${k}"`).join(',')})`)
      }}
      okButtonText="IMPORT"
      onOk={(checkedTasksList) => (new Promise((resolve, reject) => {
        groupAndSortByParentKey(checkedTasksList).then((taskGroups) => {
          const taskGroupsData: { [parentKey: string]: (string | number | null)[][] } = {}
          const parentKeyList = Object.keys(taskGroups)
          parentKeyList.forEach((key) => {
            taskGroupsData[key] = taskGroups[key].map((t) => {
              return taskToDataArray(t).map(d => isoDateToNormalizedDate(d))
            })
          })
          console.log('taskGroupsData: ', taskGroupsData)
          google.script.run
            .withSuccessHandler((updateStatusHashJSON: string) => {
              const newUpdateStatusHash: { [taskKey: string]: string } = JSON.parse(updateStatusHashJSON)
              resolve(newUpdateStatusHash)
            })
            .withFailureHandler((error, object) => {
              console.error('import error: ', error, object)
              reject({
                error,
                object,
              })
            })
            .importSubtaskGroupsByJson(JSON.stringify(taskGroupsData))
        })

      }))}
    />
  )
}

export default withJiraStatusCheck(ImportTaskFromJira,'import-task-from-jira') 