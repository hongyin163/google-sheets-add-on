/**
 * @file 根据 task-key 补全信息
 * 
 */

import React, { useEffect, useState } from 'react'
import withJiraStatusCheck from '../../../_share/components/CheckJiraStatus'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import Typography from '@mui/material/Typography'


function addTaskToMyTasks() {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((updateStatusHashJSON: string) => {
        resolve(updateStatusHashJSON)
      })
      .withFailureHandler((error) => {
        reject(error)
      })
      .addToMyTaskList()
  })

}

const Processing = () => {

  const [processStatus, setProcessStatus] = useState<'processing' | 'success' | 'failed'>('processing')
  const [statusText, setStatusText] = useState<string>('Waiting')

  const process = async () => {
    try {
      setProcessStatus('processing')
      await addTaskToMyTasks();
      setProcessStatus('success')
      setStatusText('Success!')
    } catch (error) {
      setProcessStatus('failed')
      setStatusText(error.message)
    }
  }

  useEffect(() => {
    process().then(() => { })
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
      <Box sx={{ textAlign: 'center' }}>
        {processStatus === 'processing' ? (
          <CircularProgress size={64} />
        ) : (processStatus === 'success' ? (
          <CheckCircleIcon sx={{ fontSize: '64px' }} color="success" />
        ) : (processStatus === 'failed' ? (
          <ErrorIcon sx={{ fontSize: '64px' }} color="error" />
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

export default withJiraStatusCheck(Processing, 'add-task-to-tasks')
