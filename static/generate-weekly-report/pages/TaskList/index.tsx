import React, { useState } from 'react';
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';
import { Task, User } from '../../../_share/types/global';
import withJiraStatusCheck from '../../../_share/components/CheckJiraStatus';
import EditReport from '../EditReport';
import PreviewReport from '../PreviewReport';

const TaskList = () => {
  const [thoughtsCN, setThoughtsCN] = useState('');
  const [thoughtsEN, setThoughtsEN] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [modifiedThisWeek, setModifiedThisWeek] = useState<string>(undefined);
  const [modifiedNextWeek, setModifiedNextWeek] = useState<string>(undefined);
  const [selectDate, setSelectDate] = useState<Date[]>([startOfMonth(new Date()), endOfMonth(new Date())]);
  const [selectUser, setSelectUser] = useState<User>(undefined);
  const [taskThisWeek, setTaskThisWeek] = useState<Task[]>([]);
  const [taskNextWeek, setTaskNextWeek] = useState<Task[]>([]);

  return (
    isEditing ?
      <EditReport
        thoughtsCN={thoughtsCN}
        thoughtsEN={thoughtsEN}
        modifiedThisWeek={modifiedThisWeek}
        modifiedNextWeek={modifiedNextWeek}
        selectDate={selectDate}
        selectUser={selectUser}
        taskThisWeek={taskThisWeek}
        taskNextWeek={taskNextWeek}
        setThoughtsCN={setThoughtsCN}
        setIsEditing={setIsEditing}
        setThoughtsEN={setThoughtsEN}
        setModifiedThisWeek={setModifiedThisWeek}
        setModifiedNextWeek={setModifiedNextWeek}
        setSelectDate={setSelectDate}
        setSelectUser={setSelectUser}
        setTaskThisWeek={setTaskThisWeek}
        setTaskNextWeek={setTaskNextWeek}
      /> :
      <PreviewReport
        thoughtsCN={thoughtsCN}
        thoughtsEN={thoughtsEN}
        modifiedThisWeek={modifiedThisWeek}
        modifiedNextWeek={modifiedNextWeek}
        selectUser={selectUser}
        selectDate={selectDate}
        setIsEditing={setIsEditing}
      />
  )
}

export default withJiraStatusCheck(TaskList,'generate-weekly-report');
