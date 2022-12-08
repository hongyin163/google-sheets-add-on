import { Issue } from 'jira.js/out/version2/models/issue';
import client from '../../_share/lib/JiraClient';
import { SubTask, Task } from '../../_share/types/global';
import { formatDate } from '../utils';
const MAX_SEARCH_RESULTS_PER_PAGE = 9999;


export async function getIssues(jql: string): Promise<Issue[]> {
    const result = await client.issueSearch.searchForIssuesUsingJql({
        jql,
        maxResults: MAX_SEARCH_RESULTS_PER_PAGE,
    });
    return result.issues || [];
}

export async function getTasks(jql: string): Promise<Task[]> {
    const issues = await getIssues(jql);
    const map = new Map();
    // 找到所有task
    for (let issue of issues) {
        const taskKey = issue.fields.parent?.key;
        if (!map.has(taskKey)) {
            const task: Task = {
                key: taskKey,
                summary: issue.fields.parent?.fields.summary,
                plannedUATDate: issue.fields.customfield_11522||'',
                plannedReleaseDate: issue.fields.customfield_11513||'',
                status: issue.fields.status.name,
                subtasks: [],
            }
            map.set(taskKey, task);
        }
    }
    // 关联subtask和task
    map.forEach((value, key) => {
        value.subtasks = issues
            .filter(subtask => key === subtask.fields.parent?.key)
            .map(subtask => {
                return {
                    key: subtask.key,
                    summary: subtask.fields.summary,
                    status: subtask.fields.status.name.toUpperCase(),
                    startDate: subtask.fields.customfield_11200||'',
                    dueDate: subtask.fields.duedate||'',
                    plannedDevStartDate: subtask.fields.customfield_11520||'',
                    plannedDevDueDate: subtask.fields.customfield_11509||'',
                    devStartDate: subtask.fields.customfield_11516||'',
                    devDueDate: subtask.fields.customfield_10304||''
                } as SubTask;
            })
    })
    // 将map转化为数组，便于渲染
    const flattenMap: Task[] = [];
    map.forEach((value, key) => flattenMap.push(value));
    // console.log(flattenMap)
    return flattenMap;
}

export function buildJQL(user = '', dueField = 'duedate', startDate: Date, endDate: Date) {
    const query = `type = sub-task and assignee in (${user})  and "${dueField}" >= "${formatDate(startDate)}" and "${dueField}" < "${formatDate(endDate)}" and "Status" != "Closed"`;
    return query;
    // const jql = 'parent in ("SPML-13617")'
    // return jql;
}