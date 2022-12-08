/**
 * @file Jira Client 全局单例模式
 * 
 */

import { Version2Client } from 'jira.js/out/version2'
import { JIRA_URL } from '../../config/constant'

const client = new Version2Client({
  host: JIRA_URL,
  noCheckAtlassianToken: true
})

export default client
