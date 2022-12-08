import React, { useEffect, useRef, useState } from 'react'
import { SearchResults, Issue } from 'jira.js/out/version2/models'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Box from '@mui/material/Box'
import Button from '@mui/lab/LoadingButton'
import ButtonGroup from '@mui/material/ButtonGroup'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import SaveAltIcon from '@mui/icons-material/SaveAlt'
import Stack from '@mui/material/Stack'
import SearchIcon from '@mui/icons-material/Search'
import { RangeListValues } from '../../config/constant'
import JQLAutocompleteInput from '../JQLAutocompleteInput'
import { COLUMN_CONFIG } from '../../config/field-config'
import {
  getRoleFromSummary,
} from '../../lib/util'
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks'
import JiraList, { RefInterface as JiraListRefInterface } from '../JiraList'
import JiraListPagination from '../JiraListPagination'
// import withJiraStatusCheck from '../CheckJiraStatus'
import { statusColorNamePreset } from '../JiraStatus'
import client from '../../lib/JiraClient'

const MAYBE_TASK_MAX_LENGTH = 400

const taskColNum = COLUMN_CONFIG.findIndex((c) => c.key === 'Task')
const statusColNum = COLUMN_CONFIG.findIndex((c) => c.key === 'Status')

const MAX_SEARCH_RESULTS_PER_PAGE = 9999

const TASK_KEY_REGEX = /^[A-Z]+-[0-9]+$/

export interface Props {
  isFullPage?: boolean
  jql?: string
  onJqlChangeByUser?: (jql: string) => void
  onTaskKeyListChange?: (taskKeyList: string[]) => void
  onTaskListChange?: (taskList: Issue[]) => void
  onSelectedTaskListChange?: (taskList: Issue[]) => void
  okButtonText?: string
  onOk?: (checkedTasksList: Issue[], allTasksList: Issue[]) => Promise<{ [taskKey: string]: string }>
}

const TaskList = (props: Props) => {
  const {
    isFullPage,
    jql,
    onJqlChangeByUser,
    onTaskKeyListChange,
    onTaskListChange,
    onSelectedTaskListChange,
    okButtonText,
    onOk,
  } = props
  const [selectedRows, setSelectedRows] = useState<RangeListValues>([])
  const [keyList, setKeyList] = useState<string[]>([])
  const [jqlIsTouched, setJqlIsTouched] = useState(false)
  const [searchResults, setSearchResults] = useState<Issue[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [checkedTasksList, setCheckedTasksList] = useState<Issue[]>([])
  const [updateStatusHash, setUpdateStatusHash] = useState<{ [taskKey: string]: string }>({})
  const [fetchingSelectedRows, setFetchingSelectedRows] = useState(true)
  const [fetchingSearchResults, setFetchingSearchResults] = useState(true)
  const [updatingTasks, setUpdatingTasks] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [oldStatus, setOldStatus] = useState<{ [taskKey: string]: string }>({})
  const jiraListRef = useRef<JiraListRefInterface>()

  const fetchSelectedRows = () => {
    setJqlIsTouched(false)
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

  const emptySearch = () => {
    setSearchResults([])
    setCurrentPage(0)
    setTotal(0)
    setFetchingSearchResults(false)
    jiraListRef.current.clear()
  }

  const search = (page?: number, clearSelection?: boolean) => {
    const _page = typeof page === 'number' ? page : currentPage
    setFetchingSearchResults(true)
    setUpdateSuccess(false)
    client.issueSearch
      .searchForIssuesUsingJql({
        jql,
        startAt: _page * MAX_SEARCH_RESULTS_PER_PAGE,
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
        setCurrentPage(res.startAt / MAX_SEARCH_RESULTS_PER_PAGE)
        setTotal(res.total)
        setFetchingSearchResults(false)
        setUpdateStatusHash({})
        setUpdatingTasks(false)
        setUpdateSuccess(false)
        if (clearSelection) {
          jiraListRef.current.clear()
        }
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

  const onOkClick = () => {
    if (onOk) {
      const issues = searchResults;
      setUpdatingTasks(true)
      setSearchResults(checkedTasksList)
      const taskQueue = [...checkedTasksList]
      taskQueue.forEach(task => {
        if (updateStatusHash[task.key] !== 'Processing...') {
          setUpdateStatusHash(p => ({ ...p, [task.key]: 'Processing...' }))
        }
      })
      onOk(checkedTasksList, searchResults).then(newUpdateStatusHash => {
        setUpdateStatusHash(p => ({ ...p, ...newUpdateStatusHash }))
        setUpdatingTasks(false)
        setUpdateSuccess(true)
      }).catch(reason => {
        setUpdateStatusHash({})
        setUpdatingTasks(false)
        setUpdateSuccess(false)
        setSearchResults(issues)
        console.error(reason)
        // todo: show error msg friendly
        if (typeof reason?.error?.message === 'string') {
          alert(`An ERROR occurred.\n\n${reason.error.message}`)
        }
      })
    }
  }

  useEffect(() => {
    fetchSelectedRows()
  }, [])

  useEffect(() => {
    const _keyList: string[] = []
    const _oldStatus = {...oldStatus}
    selectedRows.forEach((range) => {
      range.forEach((row) => {
        const taskKey = row[taskColNum]
        if (taskKey && typeof taskKey === 'string' && TASK_KEY_REGEX.test(taskKey)) {
          _keyList.push(taskKey)
          const status = row[statusColNum] as (string | undefined)
          if (status && statusColorNamePreset[status]) {
            _oldStatus[taskKey] = status
          }
        }
      })
    })
    setKeyList(_keyList)
    setOldStatus(_oldStatus)
  }, [selectedRows])

  useEffect(() => {
    if (keyList && keyList.length && !jqlIsTouched) {
      onTaskKeyListChange(keyList)
    }
  }, [keyList])

  useEffect(() => {
    if (!jqlIsTouched) {
      if (jql) {
        search(0, true)
      } else {
        emptySearch()
      }
    }
  }, [jql])

  useEffect(() => {
    if (onTaskListChange && checkedTasksList !== searchResults) {
      onTaskListChange(searchResults)
    }
  }, [searchResults])

  useEffect(() => {
    if (onSelectedTaskListChange) {
      onSelectedTaskListChange(checkedTasksList)
    }
  }, [checkedTasksList])

  const searchButtonPopupState = usePopupState({ variant: 'popover', popupId: 'search-more' })
  const selectedCount = checkedTasksList.length

  return (
    <Stack
      direction="column"
      justifyContent="space-between"
      alignItems="stretch"
      spacing={0}
      sx={isFullPage ? {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        fontSize: '0.875rem',
      } : {
        fontSize: '0.875rem',
      }}
    >
      <Box sx={{ flex: 'auto', overflow: 'auto' }}>
        <Box sx={{ padding: '16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <JQLAutocompleteInput
            value={jql}
            onChange={(e) => {
              if (typeof onJqlChangeByUser === 'function') {
                onJqlChangeByUser(e.currentTarget.value)
              }
              setJqlIsTouched(true)
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
                onClick={() => search(0, true)}
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
                  Reset JQL by seleced rows
                </MenuItem>
              </Menu>
            </ButtonGroup>
          </Box>
        </Box>
        <JiraList
          ref={jiraListRef}
          dataSource={searchResults}
          pageSize={MAX_SEARCH_RESULTS_PER_PAGE}
          total={total}
          loading={fetchingSearchResults || fetchingSelectedRows}
          updating={updatingTasks}
          allSuccess={updateSuccess}
          getIssueUpdateStatus={r => updateStatusHash[r.key]}
          onCheckChange={checkedList => setCheckedTasksList(checkedList)}
          oldStatus={oldStatus}
          highlightByClick
        />
      </Box>

      <JiraListPagination
        currentPage={currentPage}
        pageSize={MAX_SEARCH_RESULTS_PER_PAGE}
        total={total}
        onPageChange={search}
        hide={updatingTasks || updateSuccess}
      />

      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        spacing={0.5}
        sx={{ padding: '8px 16px', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}
      >
        <Box sx={{ flex: 'auto', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {/*{selectedCount} tasks selected.*/}
        </Box>
        <Button
          variant="contained"
          onClick={onOkClick}
          startIcon={<SaveAltIcon />}
          loadingPosition="start"
          loading={updatingTasks}
          size={'small'}
          disabled={selectedCount === 0 || updateSuccess}
        >
          {okButtonText}
        </Button>
      </Stack>
    </Stack>
  )
}

export default TaskList
