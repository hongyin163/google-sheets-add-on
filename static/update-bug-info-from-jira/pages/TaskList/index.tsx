import React, { useEffect, useRef, useState } from 'react'
import { SearchResults, Issue } from 'jira.js/out/version2/models'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Box from '@mui/material/Box'
import Button from '@mui/lab/LoadingButton'
import ButtonGroup from '@mui/material/ButtonGroup'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import SaveAltIcon from '@mui/icons-material/SaveAlt'
import CheckIcon from '@mui/icons-material/Check'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import List from '@mui/material/List'
import Snackbar from '@mui/material/Snackbar'
import SearchIcon from '@mui/icons-material/Search'
import { RangeListValues } from '../../../_share/config/constant'
import JQLAutocompleteInput from '../../../_share/components/JQLAutocompleteInput'
import { getRoleFromSummary } from '../../../_share/lib/util'
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import withJiraStatusCheck from '../../../_share/components/CheckJiraStatus'
import client from '../../../_share/lib/JiraClient'
import BugListInTask from '../../../_share/components/BugListInTask'

const MAYBE_TASK_MAX_LENGTH = 400

const MAX_SEARCH_RESULTS_PER_PAGE = 9999

const TASK_KEY_REGEX = /^[A-Z]+-\d+$/

const TaskList = () => {
  const [jql, setJql] = useState('')
  const [jqlIsTouched, setJqlIsTouched] = useState(false)
  const [selectedRows, setSelectedRows] = useState<RangeListValues>([])
  const [keyList, setKeyList] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<Issue[]>([])
  // const [total, setTotal] = useState(0)
  const [fetchingSelectedRows, setFetchingSelectedRows] = useState(true)
  const [fetchingSearchResults, setFetchingSearchResults] = useState(true)
  const [updatingTasks, setUpdatingTasks] = useState(false)
  // const [toBeUpdated, setToBeUpdated] = useState<{[key: string]: {bugUnsolved: number, bugTotal: number}}>({})
  const toBeUpdated = useRef<{[key: string]: {bugUnsolved: number, bugTotal: number}}>({})
  const [selectedCount, setSelectedCount] = useState(0)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [updateFailure, setUpdateFailure] = useState(false)

  const fetchSelectedRows = () => {
    setFetchingSelectedRows(true)
    google.script.run
      .withSuccessHandler((jsonValue: string) => {
        const values: RangeListValues = JSON.parse(jsonValue)
        console.log(values)
        setFetchingSelectedRows(false)
        setSelectedRows(values)
      })
      .getSelectedLineValues()
  }

  // const emptySearch = () => {
  //   setSearchResults([])
  //   setTotal(0)
  //   setFetchingSearchResults(false)
  // }

  const search = () => {
    setFetchingSearchResults(true)
    client.issueSearch
      .searchForIssuesUsingJql({
        jql,
        startAt: 0,
        maxResults: MAX_SEARCH_RESULTS_PER_PAGE,
      })
      .then((res: SearchResults) => {
        const issues = res.issues
        if (!/order by/i.test(jql)) {
          issues.sort((a, b) => {
            const roleA = getRoleFromSummary(a)
            const roleB = getRoleFromSummary(b)
            if (roleA === roleB) {
              return a.key > b.key ? 1 : -1
            }
            return roleA > roleB ? 1 : -1
          })
        }
        setSearchResults(issues)
        // setTotal(res.total)
        setFetchingSearchResults(false)
        setUpdatingTasks(false)
      })
      .catch((e) => {
        setFetchingSearchResults(false)
        console.error(e)
        // todo: show error msg
        if (keyList && (keyList.length > MAYBE_TASK_MAX_LENGTH)) {
          alert(`The number of rows exceeds the maximum.\nMax: ${MAYBE_TASK_MAX_LENGTH}\nCurrent: ${keyList.length}`)
        } else {
          alert(e && e.toString ? e.toString() : 'An error occurred while searching')
        }
      })
  }

  const onCheckChange = (data: {bugUnsolved: number, bugTotal: number, key: string}) => {
    const _toBeUpdated = toBeUpdated.current
    if (data.bugUnsolved < 0 && data.bugTotal < 0) {
      delete _toBeUpdated[data.key]
    } else {
      _toBeUpdated[data.key] = {
        bugUnsolved: data.bugUnsolved,
        bugTotal: data.bugTotal,
      }
    }
    setSelectedCount(Object.keys(toBeUpdated.current).length)
    console.log('onCheckChange', data, toBeUpdated.current)
  }

  const onOkClick = () => {
    setUpdatingTasks(true)
    console.log('updateBugInfo', toBeUpdated.current)
    google.script.run
      .withSuccessHandler((/*updateStatusHashJSON: string*/) => {
        // const newUpdateStatusHash: { [taskKey: string]: string } = JSON.parse(updateStatusHashJSON)
        setUpdatingTasks(false)
        setUpdateSuccess(true)
      })
      .withFailureHandler((error, object) => {
        console.error('error: ', error, object)
        setUpdatingTasks(false)
        setUpdateFailure(true)
        if (typeof error?.message === 'string') {
          alert(`An ERROR occurred.\n\n${error.message}`)
        }
      })
      .updateBugInfoByJson(JSON.stringify(toBeUpdated.current))
  }

  useEffect(() => {
    fetchSelectedRows()
  }, [])

  useEffect(() => {
    const _keyList: string[] = []
    selectedRows.forEach((range) => {
      range.forEach((row) => {
        row.forEach(value => {
          if (value && typeof value === 'string' && TASK_KEY_REGEX.test(value)) {
            _keyList.push(value)
          }
        })
      })
    })
    setKeyList(_keyList)
  }, [selectedRows])

  useEffect(() => {
    if (keyList && keyList.length) {
      setJqlIsTouched(false)
      setJql(`key in (${keyList.map(k => `"${k}"`).join(',')})`)
    }
  }, [keyList])

  useEffect(() => {
    if (!jqlIsTouched && jql) {
      search()
    }
  }, [jql])

  const searchButtonPopupState = usePopupState({ variant: 'popover', popupId: 'search-more' })

  const closeSnack = () => {
    setUpdateSuccess(false)
    setUpdateFailure(false)
  }

  return (
    <Stack
      direction="column"
      justifyContent="space-between"
      alignItems="stretch"
      spacing={0}
      sx={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        fontSize: '0.875rem',
      }}
    >
      <Box sx={{ flex: 'auto', overflow: 'auto' }}>
        <Box sx={{ padding: '16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <JQLAutocompleteInput
            value={jql}
            onChange={(e) => {
              setJqlIsTouched(true)
              setJql(e.currentTarget.value)
            }}
            // onValidate={(b, v) => setJqlIsValid(b && !!v)}
            disabled={updatingTasks || fetchingSearchResults || fetchingSelectedRows}
          />
          <Box sx={{ textAlign: 'right', marginTop: '4px' }}>
            <ButtonGroup>
              <Button
                variant="outlined"
                type="submit"
                size="small"
                onClick={search}
                startIcon={<SearchIcon />}
                loadingPosition="start"
                loading={fetchingSearchResults || fetchingSelectedRows}
                disabled={updatingTasks}
              >
                SEARCH
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={updatingTasks || fetchingSearchResults || fetchingSelectedRows}
                {...bindTrigger(searchButtonPopupState)}
              >
                <ArrowDropDownIcon />
              </Button>
              <Menu {...bindMenu(searchButtonPopupState)}>
                <MenuItem sx={{ fontSize: '0.875rem' }} dense onClick={() => {
                  fetchSelectedRows()
                  searchButtonPopupState.close()
                }}>
                  Reset JQL by selected rows
                </MenuItem>
              </Menu>
            </ButtonGroup>
          </Box>
        </Box>
        <List disablePadding sx={{width: '100%'}}>
          {searchResults.map((r: Issue, i) => (
            <BugListInTask
              task={r}
              updateStatus={''}
              defaultShowBugs={i === 0}
              onChange={onCheckChange}
            />
          ))}
        </List>
      </Box>

      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        spacing={0.5}
        sx={{ padding: '8px 16px', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}
      >
        <Button
          variant="contained"
          onClick={onOkClick}
          startIcon={
            updateSuccess ? <CheckIcon /> : <SaveAltIcon />
          }
          color={updateSuccess ? 'success' : 'primary'}
          loadingPosition="start"
          loading={updatingTasks}
          size={'small'}
          disabled={selectedCount === 0}
        >
          UPDATE
        </Button>
      </Stack>
      <Snackbar open={updateSuccess || updateFailure} autoHideDuration={5000} onClose={closeSnack} sx={{bottom: 50}}>
        <Alert onClose={closeSnack} variant="filled" severity={updateSuccess ? 'success' : 'error'} sx={{ width: '100%' }}>
          {updateSuccess ? 'Update success.' : 'Failure.'}
        </Alert>
      </Snackbar>
    </Stack>
  )
}

export default withJiraStatusCheck(TaskList,'update-bug-info-from-jira')
