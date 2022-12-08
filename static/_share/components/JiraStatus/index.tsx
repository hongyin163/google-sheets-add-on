/**
 * @file jira status lozenge
 * 
 */

import React from 'react'
import { Issue, StatusDetails } from 'jira.js/out/version2/models'
import './jira-status.css'

export const statusColorNamePreset: {[statusText: string]: string} = {
  'Icebox': 'blue-gray',
  'Waiting': 'blue-gray',
  'Blocking': 'yellow',
  'BRD': 'yellow',
  'PRD': 'yellow',
  'Doing': 'yellow',
  'Designing': 'yellow',
  'Reviewing': 'yellow',
  'Testing': 'yellow',
  'Staging': 'yellow',
  'Delivering': 'yellow',
  'Done': 'green',
  'Closed': 'green',
  'Reopened': 'blue-gray',
  'Resolved': 'yellow',
  'PLANNED': 'yellow',
  'In Progress': 'yellow',
  'To Do': 'blue-gray',
  'Completed': 'green',
  'Developing': 'yellow',
  'QA Test': 'yellow',
  'Integration': 'yellow',
  'Regression': 'yellow',
  'Change Delivering': 'yellow',
  'Open': 'blue-gray',
  'Under Review': 'yellow',
  'Approved': 'green',
  'Cancelled': 'green',
  'Rejected': 'green',
  'Confirmed': 'yellow',
  'Deployed': 'yellow',
  'Approving': 'blue-gray',
  'UAT': 'yellow',
  'Post-Process Check': 'yellow',
  'Action Plan': 'yellow',
  'Change Plan': 'yellow',
  'In Review': 'yellow',
  'Declined': 'green',
  'Waiting for support': 'medium-gray',
  'Waiting for customer': 'medium-gray',
  'Pending': 'yellow',
  'Canceled': 'green',
  'Escalated': 'yellow',
  'Waiting for approval': 'blue-gray',
  'Awaiting CAB approval': 'yellow',
  'Planning': 'yellow',
  'Awaiting implementation': 'yellow',
  'Implementing': 'yellow',
  'Peer review / change manager approval': 'blue-gray',
  'Work in progress': 'yellow',
  'Under investigation': 'yellow',
  'Pending (RES)': 'yellow',
  'Pending (DEP)': 'yellow',
  'Improvement': 'green',
  'ACKNOWLEDGED': 'yellow',
  'REQ. GATHERING': 'yellow',
  'FEASIBILITY STUDY': 'yellow',
  'TECH DESIGN': 'yellow',
  'BLOCKED': 'blue-gray',
  'Fix Done': 'yellow',
  'LIVE TESTING': 'yellow',
  '1ST REVIEW': 'yellow',
  '2ND REVIEW': 'yellow',
  'Verifying': 'yellow',
  'RM APPROVAL': 'blue-gray',
  'RM REJECT': 'yellow',
  'STAKEHOLDER APPROVAL': 'blue-gray',
  'STAKEHOLDER REJECT': 'yellow',
  'Waiting for Feedback': 'yellow',
  'Awaiting Deployment': 'yellow',
  'Head Manager Review': 'yellow',
  'Senior Member Review': 'yellow',
  'Team Leader Review': 'yellow',
  'Dev Lead Approval': 'blue-gray',
  'NOT DOING': 'green',
  'WAITING for INFO': 'blue-gray',
  'peer review': 'yellow',
  'UI/UX Review': 'yellow',
  'EXPERIMENT': 'yellow',
  'ROLL OUT': 'yellow',
  'REVERSE': 'yellow'
}

export interface Props {
  issue?: Issue;
  status?: StatusDetails;
  statusText?: string;
  colorName?: string;
}

export default function (props: Props) {
  const { issue, status, statusText, colorName } = props
  const _status = status || (issue ? issue.fields.status : null)
  if (!_status && !statusText) {
    return (
      <span className="jira-issue-status-lozenge .jira-issue-status-lozenge-empty">EMPTY</span>
    )
  }
  const _statusText = statusText || _status.name
  const _color = colorName || _status?.statusCategory.colorName || statusColorNamePreset[_statusText] || 'empty'
  return (
    <span className={`jira-issue-status-lozenge jira-issue-status-lozenge-${_color}`}>
      {_statusText}
    </span>
  )
}
