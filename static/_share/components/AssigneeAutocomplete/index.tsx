/**
 * @file
 * 
 */

import React, { useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { User } from '../../types/global';
import MenuItem from '@mui/material/MenuItem';
import client from '../../lib/JiraClient'

export interface Props {
  value?: User[] | User,
  onChange?: (event: React.SyntheticEvent, value: any | Array<any>, reason: string, details?: any) => void, // 当选中的用户发生变化时调用
  getOptionLabel?: (option: User) => string, // 可选项中显示User类型中的哪个字段
  multiple?: boolean, // 是否支持多选用户
  label?: string, // 标题
  showName?: boolean, // 是否展示邮箱
  style?: React.CSSProperties, // 自定义css样式
}

const debounce = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default function (props: Props) {
  const [assigneeInfo, setAssigneeInfo] = useState<User[]>([]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value as string;
    if (inputVal && inputVal !== '0') {
      client.userSearch.findUsersForPicker({ query: inputVal })
        .then((res) => {
          const data = res.users.map((user) => ({ name: user.name, displayName: user.displayName }));
          setAssigneeInfo(data);
        });
    }
  }

  const {
    value = [],
    onChange,
    getOptionLabel,
    multiple = false,
    label = "Assignee: ",
    showName = false,
    style = {}
  } = props;
  return (
    <Autocomplete
      value={value}
      onInputChange={debounce(handleInput, 100)}
      onChange={onChange}
      getOptionLabel={getOptionLabel}
      options={assigneeInfo}
      sx={{ width: '100%', marginTop: '16px', ...style }}
      multiple={multiple}
      filterOptions={(x) => x}
      renderInput={(params) => <TextField {...params} label={label} size="small" />}
      renderOption={
        (props, option) =>
          <MenuItem value={option.name} key={option.name} {...props} style={{ minHeight: '32px' }} dense>
            {showName ? option.name : option.displayName}
          </MenuItem>
      }
    />
  )
}