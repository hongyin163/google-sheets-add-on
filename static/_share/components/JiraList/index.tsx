/**
 * @file
 * 
 */

import React, { Fragment, useState, useImperativeHandle, forwardRef, MouseEvent, useEffect } from 'react'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import FilterListIcon from '@mui/icons-material/FilterList';
import CircularProgress from '@mui/material/CircularProgress'
import DoneIcon from '@mui/icons-material/Done'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText'
import { Issue } from 'jira.js/out/version2/models'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import JiraListItemWithCheckbox from '../JiraListItemWithCheckbox'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import JiraStatus, { statusColorNamePreset } from '../JiraStatus'

export const statusColorPriority: { [status: string]: number } = {
  'blue-gray': 1,
  'yellow': 2,
  'green': 3,
}

export interface StatusFilter {
  status: string;
  count: number;
  selected: boolean;
}

export interface Props {
  dataSource: Issue[]
  currentPage?: number
  pageSize?: number
  total?: number
  loading?: boolean
  updating?: boolean
  allSuccess?: boolean
  getIssueUpdateStatus?: (issue: Issue) => '' | 'Processing...' | string | undefined
  onPageChange?: (page: number) => void
  onCheckChange?: (checkedList: Issue[]) => void
  highlightByClick?: boolean
  oldStatus?: ({ [taskKey: string]: string })
}

export interface RefInterface {
  clear: () => void,
  addAllTasks: () => void,
}

export default forwardRef<RefInterface, Props>(function (props, ref) {
  const {
    dataSource,
    pageSize = 50,
    total = 0,
    loading,
    updating,
    allSuccess,
    getIssueUpdateStatus,
    onCheckChange,
    highlightByClick,
    oldStatus,
  } = props

  useImperativeHandle(ref, () => ({
    clear: () => {
      setCheckedTasksHash({})
      setCheckedCount(0)
      setIsCheckAll(false)
      setIsCheckIndeterminate(false)
      triggerCheckChange({})
    },
    addAllTasks: addAllTasks,
  }))

  const [isCheckedAll, setIsCheckAll] = useState(false)
  const [isCheckedIndeterminate, setIsCheckIndeterminate] = useState(false)
  const [checkedTasksHash, setCheckedTasksHash] = useState<{
    [taskKey: string]: Issue
  }>({})
  const [checkedCount, setCheckedCount] = useState(0)
  const [filteredCheckedCount, setFilteredCheckedCount] = useState(0)

  const triggerCheckChange = (
    newTaskHash?: { [taskKey: string]: Issue },
  ) => {
    const _taskHash = newTaskHash || checkedTasksHash
    const checkedList: Issue[] = []
    dataSource.forEach(v => {
      if (_taskHash[v.key]) {
        checkedList.push(v)
      }
    })
    if (onCheckChange) {
      onCheckChange(checkedList)
    }
  }

  const addCheckedTask = (
    taskKey: string,
    issue: Issue,
    taskKeyHash?: { [taskKey: string]: Issue }
  ) => {
    if (updating) {
      return
    }
    const _hash = taskKeyHash || { ...checkedTasksHash }
    _hash[taskKey] = issue
    if (!taskKeyHash) {
      setCheckedTasksHash(_hash)
      // refreshIsCheckedAll(_hash)
      // triggerCheckChange(_hash)
    }
  }
  const removeCheckedTask = (
    taskKey: string,
    taskKeyHash?: { [taskKey: string]: Issue }
  ) => {
    if (updating) {
      return
    }
    const _hash = taskKeyHash || { ...checkedTasksHash }
    if (_hash[taskKey]) {
      delete _hash[taskKey]
    }
    if (!taskKeyHash) {
      setCheckedTasksHash(_hash)
      // refreshIsCheckedAll(_hash)
      // triggerCheckChange(_hash)
    }
  }
  const addAllTasks = () => {
    if (updating) {
      return
    }
    const _hash = { ...checkedTasksHash }
    filteredDataSource.forEach((v) => {
      addCheckedTask(v.key, v, _hash)
    })
    setCheckedTasksHash(_hash)
    // setCheckedCount(dataSource.length)
    // setIsCheckAll(true)
    // setIsCheckIndeterminate(false)
    // triggerCheckChange(_hash)
  }
  const removeAllTasks = () => {
    if (updating) {
      return
    }
    const _hash = { ...checkedTasksHash }
    dataSource.forEach((v) => {
      removeCheckedTask(v.key, _hash)
    })
    setCheckedTasksHash(_hash)
    // setCheckedCount(0)
    // setIsCheckAll(false)
    // setIsCheckIndeterminate(false)
    // triggerCheckChange(_hash)
  }
  const refreshIsCheckedAll = (
    newTaskHash?: { [taskKey: string]: Issue },
  ) => {
    const _taskHash = newTaskHash || checkedTasksHash
    let _filteredCheckedCount = 0
    filteredDataSource.forEach((v) => {
      if (v.key && _taskHash[v.key]) {
        _filteredCheckedCount += 1
      }
    })
    setFilteredCheckedCount(_filteredCheckedCount)
    setIsCheckAll(_filteredCheckedCount > 0 && _filteredCheckedCount === filteredDataSource.length)
    setIsCheckIndeterminate(_filteredCheckedCount > 0 && _filteredCheckedCount < filteredDataSource.length)
    let _checkedCount = 0
    dataSource.forEach((v) => {
      if (v.key && _taskHash[v.key]) {
        _checkedCount += 1
      }
    })
    setCheckedCount(_checkedCount)
  }

  useEffect(() => refreshIsCheckedAll(), [dataSource, checkedTasksHash])
  useEffect(() => triggerCheckChange(), [checkedTasksHash])

  const [filterButtonEl, setFilterButtonEl] = useState<null | HTMLElement>(null)
  const [filteredDataSource, setFilterDataSource] = useState<Issue[]>(dataSource)
  const [statusList, setStatusList] = useState<StatusFilter[]>([])
  const [filterAll, setFilterAll] = useState(false)
  const [filterIndeterminate, setFilterIndeterminate] = useState(false)
  const filterMenuOpen = !!(filterButtonEl)
  const handleFilterButtonClick = (event: MouseEvent<HTMLElement>) => {
    setFilterButtonEl(event.currentTarget)
  }
  const handleFilterMenuClose = () => {
    setFilterButtonEl(null)
  }
  const handleFilterAll = () => {
    setStatusList(statusList.map(s => ({...s, selected: !filterAll})))
    setFilterAll(!filterAll)
    setFilterIndeterminate(false)
  }
  const handleFilterOne = (sf: StatusFilter) => {
    sf.selected = !sf.selected
    setStatusList([...statusList])
  }
  useEffect(() => {
    setFilterDataSource(dataSource)
    setFilterAll(true)
    setFilterIndeterminate(false)
    const _statusList: StatusFilter[] = []
    const _statusHash: {[status: string]: StatusFilter} = {}
    dataSource.forEach((data) => {
      const s = data?.fields?.status?.name || '(Empty)'
      if (!_statusHash[s]) {
        _statusHash[s] = {
          status: s,
          count: 1,
          selected: true,
        }
        _statusList.push(_statusHash[s])
      } else {
        _statusHash[s].count += 1
      }
    })
    _statusList.sort((a, b) => {
      const aPrior = statusColorPriority[statusColorNamePreset[a.status]]
      const bPrior = statusColorPriority[statusColorNamePreset[b.status]]
      return aPrior - bPrior
    })
    setStatusList(_statusList)
  }, [dataSource])
  useEffect(() => {
    if (!statusList || !statusList.length) {
      setFilterAll(false)
      setFilterIndeterminate(false)
      setFilterDataSource(dataSource)
      return
    }
    let isIndeterminate = false
    let isAll = statusList[0].selected
    for (let i = 1; i < statusList.length; i++) {
      if (statusList[i].selected !== isAll) {
        isIndeterminate = true
        isAll = false
        break
      }
    }
    setFilterAll(isAll)
    setFilterIndeterminate(isIndeterminate)

    if (!isIndeterminate) {
      setFilterDataSource(dataSource)
    } else {
      const hash: {[status: string]: boolean} = {}
      statusList.forEach(s => hash[s.status] = s.selected)
      setFilterDataSource(dataSource.filter((d) => {
        const s = d?.fields?.status?.name
        return s && hash[s]
      }))
    }
  }, [statusList])
  useEffect(() => {
    const _hash: {[taskKey: string]: Issue} = {}
    filteredDataSource.forEach((v) => {
      const taskKey = v.key
      if (checkedTasksHash[taskKey]) {
        _hash[taskKey] = v
      }
    })
    setCheckedTasksHash(_hash)
  }, [filteredDataSource])

  const selectedCount = Object.keys(checkedTasksHash).length

  return (
    <List disablePadding sx={{width: '100%'}}>
      <ListItem
        disablePadding
        sx={{
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          position: 'sticky',
          top: 0,
          zIndex: 8,
          bgcolor: allSuccess ? 'success.main' : 'background.paper',
          color: allSuccess ? 'success.contrastText' : 'text.primary'
        }}
        secondaryAction={
          <div>
            <IconButton id="filter-button" edge="end" aria-label="comments" onClick={handleFilterButtonClick}>
              <FilterListIcon />
            </IconButton>
            <Menu
              anchorEl={filterButtonEl}
              open={filterMenuOpen}
              onClose={handleFilterMenuClose}
              MenuListProps={{
                'aria-labelledby': 'filter-button',
              }}
            >
              <MenuItem dense onClick={handleFilterAll}>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    indeterminate={filterIndeterminate}
                    checked={filterAll}
                    disableRipple
                    sx={{padding: '0 9px'}}
                  />
                </ListItemIcon>
                <ListItemText>All</ListItemText>
                <Typography variant="body2" color="text.secondary">
                  {dataSource.length}
                </Typography>
              </MenuItem>
              <Divider />
              {statusList.map((sf) => (
                <MenuItem dense onClick={() => handleFilterOne(sf)}>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={sf.selected}
                      disableRipple
                      sx={{padding: '0 9px'}}
                    />
                  </ListItemIcon>
                  <ListItemText>
                    <JiraStatus statusText={sf.status}/>
                  </ListItemText>
                  <Typography variant="body2" color="text.secondary" sx={{marginLeft: 3}}>
                    {sf.count}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </div>
        }
      >
        <ListItemButton
          alignItems="flex-start"
          role={undefined}
          onClick={() => {
            if (isCheckedAll) {
              removeAllTasks()
            } else {
              addAllTasks()
            }
          }}
          disabled={loading || !filteredDataSource.length}
          dense
        >
          <ListItemIcon sx={{minWidth: 0}}>
            {(updating || loading) ? (
              <CircularProgress size={24} sx={{padding: '0 9px', marginTop: '-3px', marginLeft: '-12px'}} />
            ) : (allSuccess ? (
              <DoneIcon sx={{padding: '0 9px', marginTop: '-3px', marginLeft: '-12px', color: 'success.contrastText'}} />
            ) : (
              <Checkbox
                edge="start"
                indeterminate={isCheckedIndeterminate}
                checked={isCheckedAll}
                tabIndex={-1}
                disableRipple
                sx={{padding: '0 9px', marginTop: '-3px'}}
              />
            ))}
          </ListItemIcon>
          <ListItemText
            primary={
              loading ? 'Loading...' : (
                updating ? 'Processing...' : (
                  allSuccess ? 'Success!' : (
                    dataSource.length ?
                      `${selectedCount} task${selectedCount > 1 ? 's' : ''} selected.` :
                      'No results.'
                  )
                )
              )
            }
            secondary={
              !(
                loading || updating || allSuccess
              ) ? [
                selectedCount > checkedCount ?
                  `${selectedCount - checkedCount} on other page${total > pageSize * 2 ? 's' : ''}.` : '',
                checkedCount > filteredCheckedCount ?
                  `${checkedCount - filteredCheckedCount} filtered.` : '',
              ].join('\n') : ''
            }
            sx={{marginTop: '6px', marginBottom: '6px'}}
          />
        </ListItemButton>
      </ListItem>
      {filteredDataSource.map((r: Issue, i) => {
        const key = r.key
        const updateStatus = getIssueUpdateStatus(r)

        return (
          <Fragment key={key}>
            {i > 0 ? (
              <Divider variant="inset" component="li" sx={{ marginLeft: '42px' }}/>
            ) : null}
            <JiraListItemWithCheckbox
              issue={r}
              onClick={() => {
                if (updateStatus) {
                  if (highlightByClick && updateStatus !== 'Processing...') {
                    const rows = updateStatus.match(/(\d+)/g)
                    console.log('activateRows: ', updateStatus, rows)
                    if (rows.length > 0) {
                      google.script.run.activateRowsByJson(JSON.stringify(rows))
                    }
                  }
                } else {
                  if (checkedTasksHash[key]) {
                    removeCheckedTask(key)
                  } else {
                    addCheckedTask(key, r)
                  }
                }
              }}
              disabled={loading}
              updateStatus={updateStatus}
              checked={!!checkedTasksHash[key]}
              oldStatus={oldStatus ? oldStatus[key] : undefined}
            />
          </Fragment>
        )
      })}
    </List>
  )
})
