import React, {
  useEffect,
  useState,
  Fragment,
  useCallback,
  useImperativeHandle,
} from 'react';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
import { Checkbox, Typography } from '@mui/material';
import { JIRA_REAL_HOST } from '../../config/constant';
import JiraStatus from '../JiraStatus';
import { getFieldIndex } from '../../lib/util';
import { StatusDetails } from 'jira.js/out/version2/models';
import { ListType } from '../../types/types';
import { forwardRef } from 'react';

interface Props {
  loading: boolean;
  allSuccess: boolean;
  selectRow: (string | number)[][];
  hasSelectTask: (string | number)[][];
  setHasSelectTask: React.Dispatch<(string | number)[][]>;
  listType: ListType;
}

interface TaskItem {
  [task: string]: { checkStatus: boolean; item: (string | number)[] };
}

enum FetchStatus {
  Waiting,
  Pending,
  Success,
  Fail,
}

enum TaskStatus {
  TODO = 'To Do',
  DOING = 'Doing',
  DONE = 'Done',
  CLOSE = 'Closed',
}

// 业务组件，封装性强一点，加点业务逻辑
const DataListFromGsheets = (props: Props, ref: React.Ref<unknown>) => {
  const {
    loading,
    allSuccess,
    setHasSelectTask,
    hasSelectTask,
    selectRow = [],
    listType,
  } = props;
  const [isCheckedIndeterminate, setIsCheckIndeterminate] = useState(false);
  const [isCheckedAll, setIsCheckAll] = useState(false);
  const [checkedTasksHash, setCheckedTasksHash] = useState<TaskItem>({});
  const [hasInitCheckStatus, setHasInitCheckStatus] = useState<boolean>(false);
  const [autoAddAllTask, setAutoAddAllTask] = useState(false);

  useImperativeHandle(ref, () => ({
    clear: () => {
      setCheckedTasksHash({});
      setIsCheckAll(false);
      setIsCheckIndeterminate(false);
      setHasInitCheckStatus(false)
      console.log(checkedTasksHash, '----')
    },
  }));

  const removeAllTasks = () => {
    const _checkedTasksHash = { ...checkedTasksHash };
    const _currentHasSelectTask: (string | number)[][] = [];
    for (const key in _checkedTasksHash) {
      _checkedTasksHash[key].checkStatus = false;
    }
    setIsCheckAll(!isCheckedAll);
    setIsCheckIndeterminate(false);
    setCheckedTasksHash(_checkedTasksHash);
    setHasSelectTask(_currentHasSelectTask);
  };

  const addAllTasks = useCallback(() => {
    const _checkedTasksHash = { ...checkedTasksHash };
    const _currentHasSelectTask = [];
    for (const key in _checkedTasksHash) {
      _checkedTasksHash[key].checkStatus = true;
      _currentHasSelectTask.push(_checkedTasksHash[key].item);
    }
    console.log(_checkedTasksHash, '000000000');
    console.log();
    setIsCheckAll(!isCheckedAll);
    setIsCheckIndeterminate(false);
    setCheckedTasksHash(_checkedTasksHash);
    setHasSelectTask(_currentHasSelectTask);
  }, [checkedTasksHash]);

  // 点击单个item触发
  const onClick = (item: (string | number)[]) => {
    const _currentCheckoutStatus = { ...checkedTasksHash };
    const taskKey = item[getTaskIndex()];
    _currentCheckoutStatus[taskKey].checkStatus =
      !_currentCheckoutStatus[taskKey].checkStatus;
    const _currentHasSelectTask = [];
    for (const key in _currentCheckoutStatus) {
      if (_currentCheckoutStatus[key].checkStatus) {
        _currentHasSelectTask.push(_currentCheckoutStatus[key].item);
      }
    }
    if (_currentHasSelectTask.length === 0) {
      setIsCheckAll(false);
    }
    if (_currentHasSelectTask.length === selectRow.length) {
      setIsCheckAll(true);
    }

    setIsCheckIndeterminate(
      _currentHasSelectTask.length != 0 &&
        _currentHasSelectTask.length < selectRow.length
    );
    setHasSelectTask(_currentHasSelectTask);
    setCheckedTasksHash(_currentCheckoutStatus);
  };

  // 初始化checkoutstatus
  const initCurrentCheckStatus = (items: (string | number)[][]) => {
    const _initStatus: TaskItem = {};
    items.forEach((item) => {
      // 根据task key 为值，保存当前选中状态和当前task信息
      _initStatus[item[getTaskIndex()]] = {
        checkStatus: false,
        item: item,
      };
    });
    console.log(_initStatus, '-----------------=======');
    setCheckedTasksHash(_initStatus);
  };
  console.log(selectRow, '----selectRow');
  const getStatusDetail = (status: string): StatusDetails => {
    const currentStatus = {
      name: '',
      colorName: '',
    };
    switch (status) {
      case TaskStatus.TODO:
        (currentStatus.name = 'TODO'), (currentStatus.colorName = 'blue-gray');
        break;
      case TaskStatus.DOING:
        (currentStatus.name = 'DOING'), (currentStatus.colorName = 'yellow');
        break;
      case TaskStatus.DONE:
        (currentStatus.name = 'DONE'), (currentStatus.colorName = 'green');
        break;
      case TaskStatus.CLOSE:
        (currentStatus.name = 'CLOSE'), (currentStatus.colorName = 'green');
        break;
    }
    const _statusDetails: StatusDetails = {
      name: currentStatus.name,
      statusCategory: {
        colorName: currentStatus.colorName,
      },
    };

    return _statusDetails;
  };

  const getWaitingIcon = (item: (string | number)[]) => {
    const taskKey = item[getTaskIndex()];
    return (
      <Checkbox
        edge="start"
        checked={checkedTasksHash[taskKey]?.checkStatus}
        tabIndex={-1}
        disableRipple
        sx={{ padding: '0 9px', marginTop: '-3px' }}
      />
    );
  };

  const getItemShowIcon = (item: (string | number)[]): React.ReactElement => {
    const _sx = { padding: '0 9px', marginTop: '-3px', marginLeft: '-12px' };
    let resultEle = getWaitingIcon(item);
    switch (item[item.length - 1]) {
      case FetchStatus.Waiting:
        resultEle = getWaitingIcon(item);
        break;
      case FetchStatus.Pending:
        resultEle = <CircularProgress size={24} sx={_sx} />;
        break;
      case FetchStatus.Success:
        resultEle = <DoneIcon sx={{ ..._sx, color: 'success.main' }} />;
        break;
      case FetchStatus.Waiting:
        resultEle = <CancelIcon sx={{ ..._sx, color: 'error.main' }} />;
        break;
    }
    return resultEle;
  };

  const getTaskIndex = () => {
    if (listType === ListType.Schedule) {
      return getFieldIndex('Task');
    }
    if (listType === ListType.TaskScore) {
      return 0;
    }
  };

  useEffect(() => {
    if (!hasInitCheckStatus && selectRow.length > 0) {
      initCurrentCheckStatus(selectRow);
      setHasInitCheckStatus(true);
      setAutoAddAllTask(true);
    }
  }, [selectRow, hasInitCheckStatus]);

  useEffect(() => {
    if (autoAddAllTask) {
      addAllTasks();
      setAutoAddAllTask(false);
    }
  }, [autoAddAllTask, checkedTasksHash]);
  return (
    <List
      disablePadding
      sx={{
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        top: 0,
        zIndex: 8,
      }}
    >
      <ListItem
        disablePadding
        sx={{
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          position: 'sticky',
          top: 0,
          zIndex: 8,
          bgcolor: allSuccess ? 'success.main' : 'background.paper',
          color: allSuccess ? 'success.contrastText' : 'text.primary',
        }}
      >
        <ListItemButton
          alignItems="flex-start"
          role={undefined}
          onClick={() => {
            if (isCheckedAll) {
              removeAllTasks();
            } else {
              addAllTasks();
            }
          }}
          disabled={loading || !selectRow.length}
          dense
        >
          <ListItemIcon sx={{ minWidth: 0 }}>
            {loading ? (
              <CircularProgress
                size={24}
                sx={{
                  padding: '0 9px',
                  marginTop: '-3px',
                  marginLeft: '-12px',
                }}
              />
            ) : allSuccess ? (
              <DoneIcon
                sx={{
                  padding: '0 9px',
                  marginTop: '-3px',
                  marginLeft: '-12px',
                  color: 'success.contrastText',
                }}
              />
            ) : (
              <Checkbox
                edge="start"
                indeterminate={isCheckedIndeterminate}
                checked={isCheckedAll}
                tabIndex={-1}
                disableRipple
                sx={{ padding: '0 9px', marginTop: '-3px' }}
              />
            )}
          </ListItemIcon>
          <ListItemText
            primary={
              loading
                ? 'Loading...'
                : allSuccess
                ? 'Success!'
                : selectRow.length
                ? `${hasSelectTask.length} task${
                    hasSelectTask.length > 1 ? 's' : ''
                  } selected.`
                : 'No results.'
            }
            sx={{ marginTop: '6px', marginBottom: '6px' }}
          />
        </ListItemButton>
      </ListItem>
      <Divider />
      {Object.keys(checkedTasksHash).length > 0 &&
        selectRow.map((item, index) => {
          return (
            <Fragment key={index}>
              {index > 0 ? (
                <Divider
                  variant="inset"
                  component="li"
                  sx={{ marginLeft: '42px' }}
                />
              ) : null}
              <ListItem key={index} disablePadding>
                <ListItemButton
                  alignItems="flex-start"
                  role={undefined}
                  onClick={() => {
                    onClick(item);
                  }}
                  dense
                >
                  <ListItemIcon sx={{ minWidth: 0, marginRight: '10px' }}>
                    {getItemShowIcon(item)}
                  </ListItemIcon>
                  <ListItemText
                    primary={item[getFieldIndex('TopicName')]}
                    secondary={
                      <Fragment>
                        {listType === ListType.Schedule &&
                          Object.values(TaskStatus).includes(
                            item[getFieldIndex('Status')] as TaskStatus
                          ) && (
                            <Typography
                              sx={{
                                display: 'inline',
                                verticalAlign: 'middle',
                                float: 'right',
                              }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              <JiraStatus
                                status={getStatusDetail(
                                  item[getFieldIndex('Status')] as string
                                )}
                              />
                            </Typography>
                          )}
                        <Link
                          href={`${JIRA_REAL_HOST}/browse/${
                            item[getTaskIndex()]
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item[getTaskIndex()]}
                        </Link>
                      </Fragment>
                    }
                  ></ListItemText>
                </ListItemButton>
              </ListItem>
            </Fragment>
          );
        })}
    </List>
  );
};

export default forwardRef(DataListFromGsheets);
