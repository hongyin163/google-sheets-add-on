import React, { useEffect, useState } from "react";
import format from 'date-fns/format';
import Stack from "@mui/material/Stack";
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import MenuItem from '@mui/material/MenuItem';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import { PROJECT_ID, PRIORITIES } from '../../../_share/config/constant';
import { PRD_CONFIG as Columns } from '../../../_share/config/field-config';
import { CreateIssue, LinkIssues } from "jira.js/out/version2/parameters";
import withJiraStatusCheck from '../../../_share/components/CheckJiraStatus';
import AssigneeAutocomplete from "../../../_share/components/AssigneeAutocomplete";
import { Item, User } from '../../../_share/types/global';
import client from '../../../_share/lib/JiraClient'
import parseISO from 'date-fns/parseISO';
import { Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel } from "@mui/material";
import { LABELS } from '../../constants/labels';
import { toast } from "../../../_share/lib/util";
import CircularProgress from '@mui/material/CircularProgress'

const TaskList = () => {
  const [key, setKey] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [component, setComponent] = useState('37504'); // 存储component id, 默认选中 Listing Upload
  const [components, setComponents] = useState<Item[]>([]);
  const [UATDate, setUATDate] = useState<Date | null>(null);
  const [liveDate, setLiveDate] = useState<Date | null>(null);
  const [isInPlan, setIsInPlan] = useState('');
  const [priority, setPriority] = useState('4'); // 存储priority id, 默认选中 Low
  const [hasKey, setHasKey] = useState(true);
  // const [isTask, setIsTask] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<string[]>([]);
  const [assignee, setAssignee] = useState<User | null>(null);
  const [productManager, setProductManager] = useState<User | null>(null);
  const [labels, setLabels] = useState<string[]>([]);

  const showSelectedRowInfo = (selectedRow: string[]) => {
    setSelectedRow([...selectedRow]);
    fetchDescription(selectedRow[Columns.Epic]);
    setKey(selectedRow[Columns.Epic]);
    setSummary(selectedRow[Columns.TopicName]);
    if (selectedRow[Columns.UATDate]) {
      setUATDate(parseISO(selectedRow[Columns.UATDate]));
    }
    if (selectedRow[Columns.LiveDate]) {
      setLiveDate(parseISO(selectedRow[Columns.LiveDate]));
    }
    if (selectedRow[Columns.IsInPlan]) {
      setIsInPlan(selectedRow[Columns.IsInPlan]);
    }
  }

  const fetchSelectedRow = () => {
    return new Promise((resolve) => {
      google.script.run
        .withSuccessHandler((jsonValue: string) => {
          const selectedRow: string[] = JSON.parse(jsonValue)[0][0];
          if (selectedRow[Columns.Epic] === '') {
            setHasKey(false)
          } else {
            showSelectedRowInfo(selectedRow);
          }
          resolve(null)
        })
        .getSelectedLineValues()
    })
  }

  const formatDate = (date: Date) => {
    if (!date) return ''
    return format(date, 'yyyy-MM-dd');
  }

  const fetchDescription = (issueIdOrKey: string) => {
    client.issues.getIssue({ issueIdOrKey })
      .then((res) => setDescription(res.fields.description))
      .catch((err) => console.log('err', err));
  }

  const fetchProjectComponents = () => {
    return client.projectComponents.getProjectComponents({ projectIdOrKey: PROJECT_ID })
      .then((res) => {
        const arr = res.map((c) => ({ id: c.id, name: c.name })) as unknown as Item[];
        setComponents(arr);
      });
  }

  const createTaskFromEpic = async () => {
    if (!productManager) {
      toast('Product Manager is required');
      return;
    }
    setIsCreatingTask(true);

    const params: CreateIssue = {
      fields: {
        summary: `${renderLabels(labels)} ${summary}`,
        issuetype: { name: 'Task' },
        components: [{ id: component }],
        project: { id: PROJECT_ID },
        description,
        priority: { id: priority },
        assignee: { name: assignee.name },
        customfield_10306: { name: productManager.name },
        customfield_10001: key,
        labels
      }
    }
    try {
      const res = await client.issues.createIssue(params);
      await createLink(res.key)
      await createTaskRow(res.key);
      toast('Create task successfully');
    } catch (error) {
      toast(error && error.message);
    } finally {
      setIsCreatingTask(false);
    }
  }

  const createLink = (taskKey: string) => {
    const params: LinkIssues = {
      outwardIssue: { key: taskKey },
      inwardIssue: { key },
      type: { name: 'Release Scope' }
    }
    return client.issueLinks.linkIssues(params)
  }

  const createTaskRow = (taskKey: string) => {
    const task: string[] = [...selectedRow];
    task[Columns.TopicName] = `${renderLabels(labels)} ${summary}`;
    task[Columns.UATDate] = UATDate ? formatDate(UATDate) : '';
    task[Columns.LiveDate] = liveDate ? formatDate(liveDate) : '';
    task[Columns.IsInPlan] = isInPlan;
    task[Columns.Task] = taskKey;
    return google.script.run
      .withSuccessHandler((res) => {
        setIsCreatingTask(false);
        toast('Created successfully!');
      })
      .withFailureHandler((err) => {
        toast('Create task row :' + err.message);
      })
      .insertTaskUnderEpic(JSON.stringify(task), key);
  }

  function handleLabalChange(label: string, event: React.ChangeEvent<HTMLInputElement>, checked: boolean) {
    if (checked) {
      setLabels(labels.concat(label))
    } else {
      setLabels(labels.filter((p) => p != label))
    }
  }

  const renderLabels = (labels: string[]) => {
    return labels.map((p) => `[${p}]`).join('')
  }

  const init = async () => {
    setLoading(true);
    await Promise.all([fetchSelectedRow(), fetchProjectComponents()])
    setLoading(false);
  }

  useEffect(() => {
    init()
  }, [])

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 50 }}>
        <CircularProgress size={24}></CircularProgress>
      </div>
    )
  }

  if (!hasKey) {
    return <span>Please fill in the key of the epic first.</span>
  }

  return (
    <div
      style={{
        marginTop: 16,
      }}
    >
      <Stack
        direction="column"
        justifyContent="space-between"
        alignItems="stretch"
        spacing={1}
      >
        <div>
          <TextField
            label="Summary: "
            sx={{ width: '100%' }}
            style={{
              marginTop: 16
            }}
            size="small"
            value={summary}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setSummary(event.target.value) }}
            multiline
          >
          </TextField>
          <TextField
            label="Description: "
            sx={{ width: '100%' }}
            style={{
              marginTop: 16
            }}
            size="small"
            value={description}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setDescription(event.target.value) }}
            multiline
          >
          </TextField>

          <FormControl sx={{ margin: '10px 0' }} component="fieldset" variant="standard">
            <FormLabel component="legend">Labels:{renderLabels(labels)}</FormLabel>
            <FormGroup row={true} >
              {
                LABELS.map((label) => {
                  return (
                    <FormControlLabel
                      control={
                        <Checkbox onChange={handleLabalChange.bind(null, label)} name="gilad" />
                      }
                      label={label}
                    />
                  )
                })
              }
            </FormGroup>
          </FormControl>
          <AssigneeAutocomplete
            value={assignee}
            onChange={(event, value: User) => { setAssignee({ ...value }) }}
            getOptionLabel={option => option.displayName}
          />
          <AssigneeAutocomplete
            label="Product Manager *:"
            value={productManager}
            onChange={(event, value: User) => { setProductManager({ ...value }) }}
            getOptionLabel={option => option.displayName}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Expect UAT Date: "
              value={UATDate}
              inputFormat="yyyy-MM-dd"
              mask="____-__-__"
              onChange={(newValue) => { setUATDate(newValue) }}
              renderInput={(params) => <TextField {...params} sx={{ width: '100%' }} style={{ marginTop: 16 }} size="small" />}
            />
            <DatePicker
              label="Expect Live Date: "
              value={liveDate}
              inputFormat="yyyy-MM-dd"
              mask="____-__-__"
              onChange={(newValue) => { setLiveDate(newValue) }}
              renderInput={(params) => <TextField {...params} sx={{ width: '100%' }} style={{ marginTop: 16 }} size="small" />}
            />
          </LocalizationProvider>
          <TextField
            label="Is In Plan: "
            sx={{ width: '100%' }}
            style={{
              marginTop: 16
            }}
            size="small"
            multiline
            value={isInPlan}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setIsInPlan(event.target.value) }}
          >
          </TextField>
          <TextField
            label="Component: "
            select
            sx={{ width: '100%' }}
            style={{
              marginTop: 20
            }}
            size="small"
            value={component}
            SelectProps={{
              MenuProps: {
                marginThreshold: 0
              }
            }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setComponent(event.target.value) }}
          >
            {components.map(c => <MenuItem value={c.id} key={c.id} dense>{c.name}</MenuItem>)}
          </TextField>
          <TextField
            label="Priority: "
            select
            sx={{ width: '100%' }}
            style={{
              marginTop: 20
            }}
            size="small"
            value={priority}
            SelectProps={{
              MenuProps: {
                marginThreshold: 0
              }
            }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setPriority(event.target.value) }}
          >
            {PRIORITIES.map(c => <MenuItem value={c.id} key={c.id} dense>{c.name}</MenuItem>)}
          </TextField>
        </div>
      </Stack>
      <LoadingButton
        variant="contained"
        sx={{
          float: 'right',
          width: '12px',
          marginTop: '16px'
        }}
        loadingPosition="start"
        loading={isCreatingTask}
        size={'small'}
        onClick={createTaskFromEpic}
      >OK
      </LoadingButton>
    </div>
  )
};

export default withJiraStatusCheck(TaskList, 'create-task-from-epic');