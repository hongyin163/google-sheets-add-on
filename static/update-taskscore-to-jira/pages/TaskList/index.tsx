import React, { useEffect, useState } from 'react';
import { ListType } from '../../../_share/types/types';
import { RefInterface as JiraListRefInterface } from '../../../_share/components/JiraList'

import { RangeListValues } from '../../../_share/config/constant';
import { getFieldIndex } from '../../../_share/lib/util';
import { Box, Button, Stack } from '@mui/material';
import withJiraStatusCheck from '../../../_share/components/CheckJiraStatus';
import DataListFromGsheets from '../../../_share/components/DataListFromGsheet';
import { useRef } from 'react';
import { TASKSCORE_TITLE } from '../../../_share/config/field-config';
import client from '../../../_share/lib/JiraClient'
enum FetchStatus {
  Waiting,
  Pending,
  Success,
  Fail,
}

const ValidIndex = {
  IssueIdIndex: 0,
  ScoreIndex: TASKSCORE_TITLE.length - 1,
}

interface TaskItem {
  [task: string]: { checkStatus: boolean; item: (string | number)[] };
}

const TaskList = () => {
  const [selectRow, setSelectRow] = useState<(string | number)[][]>([]);
  const [loading, setLoading] = useState(false);
  const [allSuccess, setAllSuccess] = useState(false);
  const [hasSelectTask, setHasSelectTask] = useState<(string | number)[][]>([]);
  const listRef = useRef<JiraListRefInterface>()
  // 点击搜索时重置参数
  const resetSearch = () => {
    setHasSelectTask([]);
    setLoading(false);
    setAllSuccess(false);
    listRef.current.clear()
  };

  const getSelectRow = () => {
    setLoading(true);
    google.script.run
      .withSuccessHandler((values: string) => {
        setLoading(false);
        handleGsheetsData(values);
        // 顺序必须在setSelectRow后面
        resetSearch();
      })
      .getSelectedLineValues();
  };

  const handleGsheetsData = (values: string): void => {
    const _values = JSON.parse(values) as RangeListValues;
    const _selectRow = _values.reduce((pre, current) => {
      const _current: (string | number)[][] = [];
      current.forEach((item) => {
        const issueId = item[ValidIndex.IssueIdIndex];
        const scroe = item[ValidIndex.ScoreIndex];
        if (issueId && scroe) {
          // 0：未开始，1：开始请求，2：请求成功，3：请求失败
          item.push(FetchStatus.Waiting);
          _current.push(item);
        }
      });
      pre.push(..._current);
      return pre;
    }, []);
    setSelectRow(_selectRow);
  };


  const editIssue = (_currentItem: (string | number)[]) => {
    const _params = {
      issueIdOrKey: _currentItem[ValidIndex.IssueIdIndex] as string,
      update: {
        customfield_10907: [
          { set: { value: _currentItem[ValidIndex.ScoreIndex] + '' } },
        ],
      },
    };
    changeCurrentItem(_currentItem, FetchStatus.Pending);

    return client.issues.editIssue(_params, (error) => {
      if (!error) {
        changeCurrentItem(_currentItem, FetchStatus.Success);
      } else {
        changeCurrentItem(_currentItem, FetchStatus.Fail);
        // todo
      }
    });
  };

  const changeCurrentItem = (
    _currentItem: (string | number)[],
    status: FetchStatus
  ) => {
    for (const item of selectRow) {
      if (item[getFieldIndex('Task')] === _currentItem[getFieldIndex('Task')]) {
        item[item.length - 1] = status;
      }
    }
    setSelectRow([...selectRow]);
  };

  const initTaskScoreIndex = (callback: (num: number) => void) => {
    google.script.run.withSuccessHandler((num) => {
      callback && callback(num);
    }).withFailureHandler((err) => {
      console.error(err);
    })._getColumnNumByRegexp('Score')
  }

  // put issue
  const putIssue = async () => {
    initTaskScoreIndex(async (num) => {
      ValidIndex.ScoreIndex = num;

      for (let i = 0; i < selectRow.length; i++) {
        try {
          await editIssue(selectRow[i]);
        } catch (error) { }
      }
      setAllSuccess(true);
      setSelectRow([...hasSelectTask]);
    });
  };

  useEffect(() => {
    getSelectRow();
  }, []);

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
      <Box sx={{ flex: 'auto', overflow: 'auto' }}>
        <DataListFromGsheets
          ref={listRef}
          loading={loading}
          allSuccess={allSuccess}
          setHasSelectTask={setHasSelectTask}
          hasSelectTask={hasSelectTask}
          selectRow={selectRow}
          listType={ListType.TaskScore}
        />
      </Box>
      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        spacing={0.5}
        sx={{ padding: '8px 16px', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}
      >
        <Button
          variant="contained"
          size={'small'}
          onClick={putIssue}
          disabled={hasSelectTask.length === 0 || allSuccess}
        >
          UPDATE
        </Button>
        <Button variant="outlined" size={'small'} onClick={getSelectRow}>
          Reset
        </Button>
      </Stack>
    </Stack>
  );
};

export default withJiraStatusCheck(TaskList,'update-taskscore-to-jira');
