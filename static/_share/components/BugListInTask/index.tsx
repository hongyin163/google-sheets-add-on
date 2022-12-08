/**
 * @file Bug list in one Task
 * 
 */

import React, { Fragment, useEffect, useState } from 'react'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import List from '@mui/material/List'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import JiraStatus from '../JiraStatus'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import Checkbox from '@mui/material/Checkbox'
import Link from '@mui/material/Link'
import { JIRA_REAL_HOST } from '../../config/constant'
import { Issue } from 'jira.js/out/version2/models'
import Divider from '@mui/material/Divider'



export interface Props {
  task: Issue
  updateStatus?: '' | 'Processing...' | string
  defaultShowBugs?: boolean
  onChange?: (data: {bugUnsolved: number, bugTotal: number, key: string}, task: Issue) => void
}

export default function (props: Props) {
  const { task, updateStatus, defaultShowBugs, onChange } = props
  const key = task.key
  const issueLinks = task.fields.issuelinks || []
  const bugList = issueLinks.filter(issue => {
    if (issue.type.id !== '10000') {
      return false
    }
    const inwardIssue = issue.inwardIssue
    if (!inwardIssue) {
      return false
    }
    return inwardIssue.fields.issuetype.id === '10003';
  })
  const bugTotal = bugList.length
  const bugUnsolved = bugList.reduce((count, bug) => {
    // statusCategory with green, such as done, close, etc.
    if (bug.inwardIssue.fields.status.statusCategory.id === 3) {
      return count
    }
    return count + 1
  }, 0)

  const [checkUnsolved, setCheckUnsolved] = useState(false)
  const [checkTotal, setCheckTotal] = useState(false)
  const [showBugs, setShowBugs] = useState(defaultShowBugs)

  const fireChange = (
    data: {bugUnsolved?: number, bugTotal?: number} = {}
  ) => {
    if (typeof onChange === 'function') {
      onChange({
        bugUnsolved: checkUnsolved ? bugUnsolved : -1,
        bugTotal: checkTotal ? bugTotal : -1,
        key,
        ...data,
      }, task)
    }
  }

  // const toggleSelectAll = () => {
  //   if (checkUnsolved && checkTotal) {
  //     setCheckUnsolved(false)
  //     setCheckTotal(false)
  //     fireChange({
  //       bugUnsolved: -1,
  //       bugTotal: -1,
  //     })
  //   } else {
  //     setCheckUnsolved(true)
  //     setCheckTotal(true)
  //     fireChange({
  //       bugUnsolved,
  //       bugTotal,
  //     })
  //   }
  // }
  const toggleBugs = () => {
    setShowBugs(!showBugs)
  }
  const toggleUnsolved = () => {
    setCheckUnsolved(!checkUnsolved)
    // fireChange({
    //   bugUnsolved: checkUnsolved ? -1 : bugUnsolved,
    // })
  }
  const toggleTotal = () => {
    setCheckTotal(!checkTotal)
    // fireChange({
    //   bugTotal: checkTotal ? -1 : bugTotal,
    // })
  }

  useEffect(() => fireChange(), [checkUnsolved, checkTotal])

  return (
    <ListItem
      disablePadding
      sx={{borderBottom: '1px solid rgba(0, 0, 0, 0.12)', flexDirection: 'column', alignItems: 'stretch'}}
    >
      <List disablePadding>
        <ListItemButton
          alignItems="flex-start"
          onClick={toggleBugs}
          disabled={!bugTotal}
          component="li"
          dense
        >
          <ListItemText
            primary={<strong>{task.fields.summary}</strong>}
            secondary={
              <Fragment>
                <Typography
                  sx={{ display: 'inline', verticalAlign: 'middle', float: 'right' }}
                  component="span"
                  variant="body2"
                >
                  {showBugs ?
                    <ExpandLess sx={{ padding: '0 9px', marginTop: '-3px', marginRight: '-12px' }} /> :
                    <ExpandMore sx={{ padding: '0 9px', marginTop: '-3px', marginRight: '-12px' }} />}
                </Typography>
                <Link
                  href={`${JIRA_REAL_HOST}/browse/${key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {key}
                </Link>
              </Fragment>
            }
          />
          {/*<ListItemIcon sx={{ minWidth: 0 }}>
            {showBugs ?
              <ExpandLess sx={{ padding: '0 9px', marginTop: '-3px', marginRight: '-12px' }} /> :
              <ExpandMore sx={{ padding: '0 9px', marginTop: '-3px', marginRight: '-12px' }} />}
          </ListItemIcon>*/}
        </ListItemButton>
        <Collapse component="li" in={bugTotal ? showBugs : true} timeout="auto" unmountOnExit>
          <List disablePadding>
            {bugList.map(bug => (
              <Fragment>
                <Divider variant="inset" component="li" sx={{ marginLeft: '42px' }}/>
                <ListItem
                  alignItems="flex-start"
                  dense
                >
                  <ListItemIcon sx={{ minWidth: 0 }}>
                    <Typography sx={{ padding: '0 9px', marginTop: '-3px', marginLeft: '-4px', width: '1em', textAlign: 'center', }}>-</Typography>
                    {/*<Minus sx={{ padding: '0 9px', marginTop: '-3px', marginRight: '-12px' }} />*/}
                  </ListItemIcon>
                  <ListItemText
                    primary={bug.inwardIssue.fields.summary}
                    secondary={
                      <Fragment>
                        <Typography
                          sx={{ display: 'inline', verticalAlign: 'middle', float: 'right' }}
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          <JiraStatus status={bug.inwardIssue.fields.status} />
                        </Typography>
                        <Link
                          href={`${JIRA_REAL_HOST}/browse/${bug.inwardIssue.key}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {bug.inwardIssue.key}
                        </Link>
                      </Fragment>
                    }
                  />
                </ListItem>
              </Fragment>
            ))}
          </List>
        </Collapse>
        <Divider variant="inset" component="li" sx={{ marginLeft: '42px' }}/>
        <ListItemButton
          alignItems="flex-start"
          onClick={toggleUnsolved}
          dense
          component="li"
        >
          <ListItemIcon sx={{ minWidth: 0 }}>
            <Checkbox
              edge="start"
              checked={checkUnsolved}
              tabIndex={-1}
              disableRipple
              disabled={!!updateStatus}
              sx={{ padding: '0 9px', marginTop: '-3px' }}
            />
          </ListItemIcon>
          <ListItemText>
            <Typography
              sx={{ display: 'inline', verticalAlign: 'middle', float: 'right' }}
              component="strong"
              variant="body2"
              color="text.primary"
            >
              {bugUnsolved}
            </Typography>
            <Typography
              component="span"
              variant="body2"
              color="text.primary"
            >
              Bug Unsolved:
            </Typography>
          </ListItemText>
        </ListItemButton>
        <Divider variant="inset" component="li" sx={{ marginLeft: '42px' }}/>
        <ListItemButton
          alignItems="flex-start"
          onClick={toggleTotal}
          dense
          component="li"
        >
          <ListItemIcon sx={{ minWidth: 0 }}>
            <Checkbox
              edge="start"
              checked={checkTotal}
              tabIndex={-1}
              disableRipple
              disabled={!!updateStatus}
              sx={{ padding: '0 9px', marginTop: '-3px' }}
            />
          </ListItemIcon>
          <ListItemText>
            <Typography
              sx={{ display: 'inline', verticalAlign: 'middle', float: 'right' }}
              component="strong"
              variant="body2"
              color="text.primary"
            >
              {bugTotal}
            </Typography>
            <Typography
              component="span"
              variant="body2"
              color="text.primary"
            >
              Bug Total:
            </Typography>
          </ListItemText>
        </ListItemButton>
      </List>
    </ListItem>
  )
}
