import React, { useEffect, useState, Fragment } from 'react';
import holidayDay from '../../../../holiday.json';
import { ListType } from '../../../_share/types/types';
import DataListFromGsheets from '../../../_share/components/DataListFromGsheet';
import { RefInterface as JiraListRefInterface } from '../../../_share/components/JiraList';

import moment, { Moment } from 'moment';
// import format from 'date-fns/format'
import { RangeListValues } from '../../../_share/config/constant';
import { getFieldIndex } from '../../../_share/lib/util';
import { Box, Button, Stack } from '@mui/material';
import withJiraStatusCheck from '../../../_share/components/CheckJiraStatus';
import { useRef } from 'react';
import client from '../../../_share/lib/JiraClient'

enum FetchStatus {
  Waiting,
  Pending,
  Success,
  Fail,
}

const TaskList = () => {
  const [selectRow, setSelectRow] = useState<(string | number)[][]>([]);
  const [loading, setLoading] = useState(false);
  const [allSuccess, setAllSuccess] = useState(false);
  const [hasSelectTask, setHasSelectTask] = useState<(string | number)[][]>([]);

  const listRef = useRef<JiraListRefInterface>();

  // 点击搜索时重置参数
  const resetSearch = () => {
    setHasSelectTask([]);
    setLoading(false);
    setAllSuccess(false);
    listRef.current.clear();
  };

  const getSelectRow = () => {
    setLoading(true);
    google.script.run
      .withSuccessHandler((values: string) => {
        setLoading(false);
        handleGsheetsData(values);
        // 这里顺序不能变
        resetSearch();
      })
      .getSelectedLineValues();
  };

  const handleGsheetsData = (values: string): void => {
    const _values = JSON.parse(values) as RangeListValues;
    const _selectRow = _values.reduce((pre, current) => {
      const _current: (string | number)[][] = [];
      current.forEach((item) => {
        const _duedate = item[getFieldIndex('DueDate')];
        const _storyPoints = item[getFieldIndex('StoryPoints')];

        const _planUatDate = item[getFieldIndex('ExpectUATDate')];
        const _planReleaseDate = item[getFieldIndex('ExpectLiveDate')];

        // if (_duedate && _storyPoints || _planUatDate || _planReleaseDate) {
        // 0：未开始，1：开始请求，2：请求成功，3：请求失败
        item.push(FetchStatus.Waiting);
        _current.push(item);
        // }
      });
      pre.push(..._current);
      return pre;
    }, []);
    console.log('handleGsheetsData', _selectRow)
    setSelectRow(_selectRow);
  };

  const editIssue = (_currentItem: (string | number)[]) => {
    const _duedate = _currentItem[getFieldIndex('DueDate')];
    const _storyPoints = _currentItem[getFieldIndex('StoryPoints')];
    const _planUatDate = _currentItem[getFieldIndex('ExpectUATDate')];
    const _planReleaseDate = _currentItem[getFieldIndex('ExpectLiveDate')];

    let _params = {
      issueIdOrKey: _currentItem[getFieldIndex('Task')] as string,
      fields: {},
    };

    if (_duedate && _storyPoints) {
      const _startdate = _currentItem[getFieldIndex('StartDate')] || getStartDate(Number(_storyPoints), _duedate as string);
      _params.fields = {
        ..._params.fields,
        duedate: moment(_duedate).utcOffset(8).format(),
        customfield_10100: _storyPoints,
        customfield_11200: moment(_startdate).utcOffset(8).format()
      }
    } else if (!_duedate) {
      // 没有duedate，duedate和startdate清空
      _params.fields = {
        ..._params.fields,
        duedate: null,
        customfield_11200: null
      }
    }

    _params.fields = {
      ..._params.fields,
      customfield_11522: moment(_planUatDate).isValid() ? moment(_planUatDate).utcOffset(8).format() : null,
      customfield_11513: moment(_planReleaseDate).isValid() ? moment(_planReleaseDate).utcOffset(8).format() : null,
    }

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

  // 跳过周六日
  const getStartDate = (
    storyPoints: number,
    dueDate: string | Moment
  ): string | Moment => {
    let currentDate = moment(dueDate);
    const weekDay = ['1', '2', '3', '4', '5']; // 工作日
    const restDay = ['6', '7']; // 周六日
    while (true) {
      const _currentDateFormat = moment(currentDate).format('YYYY-M-D');
      const _holidayDay = holidayDay[moment(currentDate).format('YYYY')]; // 获取当前年份的节假日信息
      // 在周一到周五 & 不在法定节假日 || 在周六日但是需要调休
      if (
        (weekDay.includes(currentDate.format('E')) &&
          !_holidayDay.libertyDay.includes(_currentDateFormat)) ||
        (restDay.includes(currentDate.format('E')) &&
          _holidayDay.daysOff.includes(_currentDateFormat))
      ) {
        storyPoints--;
      }
      if (storyPoints <= 0) return currentDate;
      currentDate = moment(currentDate).subtract(1, 'day');
    }
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

  // put issue
  const putIssue = async () => {
    for (let i = 0; i < hasSelectTask.length; i++) {
      try {
        await editIssue(hasSelectTask[i]);
      } catch (error) { }
    }
    setAllSuccess(true);
    setSelectRow([...hasSelectTask]);
  };

  useEffect(() => {
    getSelectRow();
    // setSelectRow([["","[FE][Tech]Listing Scheduling Efficiency Improvements - Update Task Score to JIra","","","To Do","","","SPML-3738","FE","Bin Chen",3,"2022-04-24T16:00:00.000Z","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],["","[FE][Tech]Listing Scheduling Efficiency Improvements - Update Task Score to Jira Deploy and Test","","","To Do","","","SPML-3739","FE","Bin Chen",2,"2022-02-06T16:00:00.000Z","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""]])
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
          listType={ListType.Schedule}
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
          disabled={hasSelectTask.length === 0 || allSuccess}
          variant="contained"
          size={'small'}
          onClick={putIssue}
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

export default withJiraStatusCheck(TaskList, 'update-task-to-jira');
