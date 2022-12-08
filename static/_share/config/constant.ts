/**
 * @file 各种常量
 */

export const JIRA_PORT = 15050;
export const JIRA_HOST = 'localhost';
export const JIRA_URL = `http://${JIRA_HOST}:${JIRA_PORT}/`;
export const JIRA_REAL_HOST = 'https://jira.domain.io'
export const PROJECT_ID = '20700'; // SPML这个project的id
export const PRIORITIES = [
  {
    id: '1',
    name: 'Highest'
  },
  {
    id: '2',
    name: 'High'
  },
  {
    id: '3',
    name: 'Medium'
  },
  {
    id: '4',
    name: 'Low'
  },
  {
    id: '5',
    name: 'Lowest'
  },
  {
    id: '10001',
    name: 'Minor'
  },
  {
    id: '10100',
    name: 'Blocker'
  },
]

export type RangeListValues = (string | number)[][][];
export const JIRA_TASK_URL = 'https://jira.domain.io/browse/'; // subtask和task的url
