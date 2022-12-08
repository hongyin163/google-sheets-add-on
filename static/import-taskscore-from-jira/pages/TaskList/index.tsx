import React, { useEffect, useMemo, useRef, useState } from 'react';
import { User } from '../../../_share/types/global';
import {
  Alert,
  Button,
  Snackbar,
  Stack,
  TextField,
} from '@mui/material';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Box from '@mui/material/Box';
import SearchIcon from '@mui/icons-material/Search';
import add from 'date-fns/add'
import format from 'date-fns/format'
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';
import { SearchResults, Issue } from 'jira.js/out/version2/models';
import JiraList, {
  RefInterface as JiraListRefInterface,
} from '../../../_share/components/JiraList';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { SCORE_CONFIG, TASKSCORE_TITLE } from '../../../_share/config/field-config';
import { getTaskValueByFieldString } from '../../../_share/lib/util';
import AssigneeAutocomplete from '../../../_share/components/AssigneeAutocomplete';
import { MobileDateRangePicker } from '@mui/lab';
import JqlDisplay from '../../components/JqlDisplay';
import client from '../../../_share/lib/JiraClient';
import withJiraStatusCheck from '../../../_share/components/CheckJiraStatus';
export interface Props {
  mode?: 'import' | 'update';
}

const MAX_SEARCH_RESULTS_PER_PAGE = 9999;

const TaskList = () => {
  const [selectDate, setSelectDate] = useState<Date[]>([startOfMonth(new Date()), endOfMonth(new Date())]);
  const [selectUser, setSelectUser] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<Issue[]>([]);
  const [updateStatusHash, setUpdateStatusHash] = useState<{
    [taskKey: string]: string;
  }>({});
  const [checkedTasksList, setCheckedTasksList] = useState<Issue[]>([]);
  const [updatingTasks, setUpdatingTasks] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [fetchingSearchResults, setFetchingSearchResults] = useState(false);
  const [openWarning, setOpenWarning] = useState(false);
  const jiraListRef = useRef<JiraListRefInterface>()

  const formatSubmitUser = (): string => {
    return selectUser.map((user) => `"${user.name}"`).join(', ');
  }

  const formatDate = (date: Date): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  }

  const addOnDay = (date: Date) => {
    return add(date, {
      days: 1
    })
  }

  const loadUserFromStore = () => {
    const users = window.localStorage.getItem('import_taskscore_from_jira_users');
    if (!users) {
      return setSelectUser([])
    }
    setSelectUser(JSON.parse(users));
  }

  const setUsersToStore = (users: User[] = []) => {
    window.localStorage.setItem('import_taskscore_from_jira_users', JSON.stringify(users))
    setSelectUser(users)
  }

  const jql = useMemo(() => {
    const query = `type = sub-task and assignee in (${formatSubmitUser()})  and resolved >= "${formatDate(selectDate[0])}" and resolved < "${formatDate(addOnDay(selectDate[1]))}" and "Status" != "Closed" and "Status" = "Done"`;
    return query;
  }, [selectUser, selectDate[0], selectDate[1]])

  const searchResultByUser = () => {
    if (!judgeParams()) return;

    setFetchingSearchResults(true);
    client.issueSearch
      .searchForIssuesUsingJql({
        jql,
        maxResults: MAX_SEARCH_RESULTS_PER_PAGE,
      })
      .then((res: SearchResults) => {
        setSearchResults(res.issues);
        jiraListRef.current.addAllTasks();
        setUpdateSuccess(false)
        setUpdateStatusHash({})
      })
      .finally(() => {
        setFetchingSearchResults(false);
      });
  };

  const judgeParams = () => {
    if (!selectDate[0] || !selectDate[1] || selectUser.length === 0) {
      setOpenWarning(true);
      return false;
    }
    return true;
  };

  const updateTaskQueueBatch = (queue: Issue[]): Promise<void> => {

    const list = queue.map((task) => {
      const data: string[] = [];
      SCORE_CONFIG.forEach((cfg) => {
        if (typeof cfg.value === 'number' && cfg.field) {
          data[cfg.value] = `${getTaskValueByFieldString(task, cfg.field)}`;
        }
      })
      return data;
    })
    return new Promise<void>((resolve, reject) => {
      google.script.run
        .withSuccessHandler(() => {
          resolve();
        })
        .withFailureHandler((error, object) => {
          console.error('import error: ', error, object);
          // todo: show error msg
          reject(error);
        })
        .insertTaskDataArrayAfterRow(1, list);
    })
  };

  const updateSelectedTaskSync = () => {
    setUpdatingTasks(true);
    jiraListRef.current.clear()
    setSearchResults(checkedTasksList);
    const taskQueue = [...checkedTasksList];
    updateTaskQueueBatch(taskQueue).then(() => {
      console.log('finished queue');
      setUpdatingTasks(false);
      setUpdateSuccess(true);
    });
  };
  const handleClose = (event: any, reason: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenWarning(false);
  };

  const createSheetsTitle = () => {
    google.script.run
      .withSuccessHandler(() => {
        // 表头插入成功之后再插入数据
        updateSelectedTaskSync()
      }).replaceTaskDataToRow(1, TASKSCORE_TITLE, true);
  }

  const handleImport = () => {
    createSheetsTitle();
  }

  useEffect(() => {
    loadUserFromStore()
  }, [])

  return (
    <Stack
      direction="column"
      justifyContent="space-between"
      alignItems="stretch"
      sx={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        fontSize: '0.875rem',
      }}
    >
      <Snackbar
        open={openWarning}
        autoHideDuration={3000}
        onClose={handleClose}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          please select user and time
        </Alert>
      </Snackbar>
      <Box sx={{ flex: 'auto', overflow: 'auto' }}>
        <Box sx={{ padding: '16px', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
          <AssigneeAutocomplete
            value={selectUser}
            style={{ marginBottom: '10px' }}
            multiple={true}
            label="Please Select User"
            onChange={(event, value: User[]) => {
              setUsersToStore([...value]);
            }}
            getOptionLabel={(option) => option.displayName}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <MobileDateRangePicker
              startText="start-time"
              endText="end-time"
              value={selectDate as any}
              onChange={(newValue: Date[]) => {
                setSelectDate(newValue);
              }}
              inputFormat='yyyy-MM-dd'
              mask='____-__-__'
              renderInput={(startProps, endProps) => (
                <React.Fragment>
                  <TextField {...startProps} size="small" />
                  <Box sx={{ mx: 2 }}> to </Box>
                  <TextField {...endProps} size="small" />
                </React.Fragment>
              )}
            />
          </LocalizationProvider>
          <Stack
            direction="row"
            alignItems="stretch"
            spacing={0.5}
            sx={{ padding: '8px 0' }}
          >
            <Button
              variant="outlined"
              type="submit"
              size="small"
              onClick={searchResultByUser}
              startIcon={<SearchIcon />}
            >
              SEARCH
            </Button>
            <Box flex={1}></Box>
            <JqlDisplay jql={jql} />
          </Stack>

        </Box>

        <JiraList
          ref={jiraListRef}
          dataSource={searchResults}
          pageSize={MAX_SEARCH_RESULTS_PER_PAGE}
          getIssueUpdateStatus={(r) => updateStatusHash[r.key]}
          updating={updatingTasks}
          allSuccess={updateSuccess}
          loading={fetchingSearchResults}
          onCheckChange={(checkedList) => setCheckedTasksList(checkedList)}
        />
      </Box>

      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        spacing={0.5}
        sx={{ padding: '8px 16px', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}
      >
        <Box
          sx={{
            flex: 'auto',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        ></Box>
        <Button
          disabled={checkedTasksList.length === 0 || updateSuccess}
          variant="contained"
          onClick={handleImport}
          startIcon={<SaveAltIcon />}
          size={'small'}
        >
          IMPORT
        </Button>
      </Stack>
    </Stack >
  );
};
export default withJiraStatusCheck(TaskList,'import-taskscore-from-jira') 