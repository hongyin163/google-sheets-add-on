/**
 * @file 根据 task-key 补全信息
 * 
 */

import React, { useEffect, useState } from 'react'
import { RangeListValues } from '../../../_share/config/constant'
import withJiraStatusCheck from '../../../_share/components/CheckJiraStatus'
import { getFieldIndex, getSelectedLineRowsAndValues, searchForIssuesUsingJql, getTaskValueByFieldString } from '../../../_share/lib/util'
import { Issue } from 'jira.js/out/version2/models'
import { COLUMN_CONFIG } from '../../../_share/config/field-config'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import Typography from '@mui/material/Typography'

export const getTaskKeysFromRangeListValues = (rangeListValues: RangeListValues): string[] => {
  const keyIndex = getFieldIndex('Task')
  const keyHash: {[key: string]: boolean} = {}
  const res: string[] = []
  const numReg = /^\d+$/
  rangeListValues.forEach(rangeValue => {
    rangeValue?.forEach(row => {
      if (row && row[keyIndex]) {
        let key = `${row[keyIndex]}`
        key = key.trim(); // 去除头尾空格
        if (numReg.test(key)) {
          key = `SPML-${key}`
        }
        keyHash[key] = true
        res.push(key)
      }
    })
  })
  return res
}

export const updateRangeListValuesFromIssues = (rangeListValues: RangeListValues, issues: Issue[]): RangeListValues => {
  const issuesHash: {[key: string]: Issue} = {}
  issues.forEach((issue) => {
    issuesHash[issue.key] = issue
  })
  const keyIndex = getFieldIndex('Task')
  const numReg = /^\d+$/
  const res: RangeListValues = []
  rangeListValues.forEach(rangeValue => {
    if (rangeValue) {
      const newRangeValue: (typeof rangeValue) = []
      rangeValue.forEach(row => {
        if (row && row[keyIndex]) {
          let key = `${row[keyIndex]}`
          key = key.trim(); // 去除头尾空格
          if (numReg.test(key)) {
            key = `SPML-${key}`
          }
          if (issuesHash[key]) {
            const newRow = [...row]
            const issue = issuesHash[key]
            COLUMN_CONFIG.forEach((column) => {
              if (column.field) {
                const value = getTaskValueByFieldString(issue, column.field)
                if (value || value === 0) {
                  newRow[column.value] = value
                }
              }
            })
            newRangeValue.push(newRow)
          } else {
            newRangeValue.push(row)
          }
        } else {
          newRangeValue.push(row || [])
        }
      })
      res.push(newRangeValue)
    } else {
      res.push([])
    }
  })
  console.log('updateRangeListValuesFromIssues', res)
  return res
}

const completeTask = (rows: string[], values: RangeListValues): Promise<void> => {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(() => resolve())
      .withFailureHandler((error, object) => {
        console.log('Error in `completeTask`.', error, object)
        reject(error)
      })
      .completeTask({
        rows,
        values,
        keyIndex: getFieldIndex('Task')
      })
  })
}

const Processing = () => {

  const [processStatus, setProcessStatus] = useState<'processing' | 'success' | 'failed'>('processing')
  const [statusText, setStatusText] = useState<string>('Loading')

  const process = async () => {
    try {
      setProcessStatus('processing')
      setStatusText('Reading sheet...')
      const {rows, values} = await getSelectedLineRowsAndValues()
      const taskKeys = getTaskKeysFromRangeListValues(values)
      const jql = `key in ("${taskKeys.join('","')}")`
      setStatusText('Fetching tasks from JIRA...')
      const issues = await searchForIssuesUsingJql(jql)
      const newValues = updateRangeListValuesFromIssues(values, issues)
      setStatusText('Updating sheet...')
      await completeTask(rows, newValues)
      setProcessStatus('success')
      setStatusText('Success!')
    } catch (error) {
      setProcessStatus('failed')
      setStatusText(error.message)
    }
  }

  useEffect(() => {
    process().then(() => {})
  }, [])

  useEffect(() => {
    console.log('process effect', processStatus)
    if (processStatus === 'success') {
      console.log('success close')
      setTimeout(() => {
        console.log('process finished 2000', processStatus)
        google.script.host.close()
      }, 2000)
    }
  }, [processStatus])

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="stretch"
      spacing={2}
      sx={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
      }}
    >
      <Box sx={{textAlign: 'center'}}>
        {processStatus === 'processing' ? (
          <CircularProgress size={64} />
        ) : (processStatus === 'success' ? (
          <CheckCircleIcon sx={{fontSize: '64px'}} color="success" />
        ) : (processStatus === 'failed' ? (
          <ErrorIcon sx={{fontSize: '64px'}} color="error" />
        ) : null))}
      </Box>
      <Stack
        direction="row"
        justifyContent="center"
      >
        <Typography>{statusText}</Typography>
      </Stack>
    </Stack>
  )
}

export default withJiraStatusCheck(Processing,'complete-task')
