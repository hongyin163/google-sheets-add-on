/**
 * @file
 * 
 */

import React, { Fragment } from 'react'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import JiraStatus from '../JiraStatus'
import Link from '@mui/material/Link'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { JIRA_REAL_HOST } from '../../config/constant'
import { Issue } from 'jira.js/out/version2/models'

export interface Props {
  issue: Issue
  onClick?: React.MouseEventHandler<HTMLDivElement>
  disabled?: boolean
  checked?: boolean
  updateStatus?: '' | 'Processing...' | string
  oldStatus?: string
  itemIcon?: React.ReactElement
}

export default function (props: Props) {
  const {
    issue,
    onClick,
    disabled,
    updateStatus,
    checked,
    oldStatus,
    itemIcon,
  } = props
  const key = issue.key

  return (
    <ListItem
      disablePadding
    >
      <ListItemButton
        alignItems="flex-start"
        role={undefined}
        onClick={onClick}
        disabled={disabled}
        dense
      >
        <ListItemIcon sx={{ minWidth: 0 }}>
          {itemIcon || (
            updateStatus === 'Processing...' ? (
              <CircularProgress size={24} sx={{ padding: '0 9px', marginTop: '-3px', marginLeft: '-12px' }}/>
            ) : (updateStatus ? (
              <Tooltip
                title={
                  <span style={{ fontSize: '0.875rem' }}>{updateStatus}</span>
                }
                placement="top-end"
                arrow
              >
                <CheckCircleIcon color="success"
                                 sx={{ padding: '0 9px', marginTop: '-3px', marginLeft: '-12px' }}/>
              </Tooltip>
            ) : (
              <Checkbox
                edge="start"
                checked={checked}
                tabIndex={-1}
                disableRipple
                sx={{ padding: '0 9px', marginTop: '-3px' }}
              />
            ))
          )}
        </ListItemIcon>
        <ListItemText
          primary={issue.fields.summary}
          secondary={
            <Fragment>
              <Typography
                sx={{ display: 'inline', verticalAlign: 'middle', float: 'right' }}
                component="span"
                variant="body2"
                color="text.primary"
              >
                {oldStatus &&
                (
                  !issue?.fields?.status?.name ||
                  oldStatus.toUpperCase() !== issue.fields.status.name.toUpperCase()
                ) ? (
                  <span style={{opacity: 0.5}}>
                    <JiraStatus statusText={oldStatus}/>
                    <ArrowForwardIcon sx={{ fontSize: 11 }} />
                  </span>
                ) : null}
                <JiraStatus issue={issue}/>
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
      </ListItemButton>
    </ListItem>
  )
}
