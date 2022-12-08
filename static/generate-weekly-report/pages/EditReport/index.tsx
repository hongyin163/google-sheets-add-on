import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Button,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
} from '@mui/material';
import Box from '@mui/material/Box';
import SearchIcon from '@mui/icons-material/Search';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { MobileDateRangePicker } from '@mui/lab';

import AssigneeAutocomplete from '../../../_share/components/AssigneeAutocomplete';
import JqlDisplay from '../../../import-taskscore-from-jira/components/JqlDisplay';
import { SubTask, Task, User } from '../../../_share/types/global';
import { debounce } from '../../../_share/lib/util';
import ReportTemplate from '../../components/ReportTemplate'
import { buildJQL, getTasks } from '../../jira/issue'
import renderTasks from '../../templates/render';
import { addDays } from '../../utils';
import defaultTpl from '../../templates/default'
import { getLocalTpl, setLocalTpl } from '../../db/local';
import {logEvent} from '../../../_share/firebase/analytics';
type Props = {
  thoughtsCN: string;
  thoughtsEN: string;
  modifiedThisWeek: string;
  modifiedNextWeek: string;
  selectDate: Date[];
  selectUser: User;
  taskThisWeek: Task[];
  taskNextWeek: Task[];
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setThoughtsCN: React.Dispatch<React.SetStateAction<string>>;
  setThoughtsEN: React.Dispatch<React.SetStateAction<string>>;
  setModifiedThisWeek: React.Dispatch<React.SetStateAction<string>>;
  setModifiedNextWeek: React.Dispatch<React.SetStateAction<string>>;
  setSelectDate: React.Dispatch<React.SetStateAction<Date[]>>;
  setSelectUser: React.Dispatch<React.SetStateAction<User>>;
  setTaskThisWeek: React.Dispatch<React.SetStateAction<SubTask[]>>;
  setTaskNextWeek: React.Dispatch<React.SetStateAction<SubTask[]>>;
}

const EditReport = ({
  thoughtsCN,
  thoughtsEN,
  modifiedThisWeek,
  modifiedNextWeek,
  selectDate,
  selectUser,
  taskThisWeek = [],
  taskNextWeek = [],
  setIsEditing,
  setThoughtsCN,
  setThoughtsEN,
  setModifiedThisWeek,
  setModifiedNextWeek,
  setSelectDate,
  setSelectUser,
  setTaskThisWeek,
  setTaskNextWeek,
}: Props) => {
  const [fetchingSearchResults, setFetchingSearchResults] = useState(false);
  const [wordZH, setWordZH] = useState('');
  const [wordEN, setWordEN] = useState('');
  const [dueField, setDueField] = useState('');
  const thisWeekRef = useRef(null);
  const nextWeekRef = useRef(null);
  const localTpl = getLocalTpl() || { name: 'default', template: defaultTpl }
  const [tplContent, setTplContent] = useState(localTpl.template);
  const [tplName, setTplName] = useState(localTpl.name);

  const formatSubmitUser = (): string => {
    return selectUser && `"${selectUser.name}"`;
  }



  const setUsersToStore = (users: User = undefined) => {
    window.localStorage.setItem('generate_weekly_report', JSON.stringify(users));
    setSelectUser(users);
  }

  const loadUserFromStore = () => {
    const users = window.localStorage.getItem('generate_weekly_report');
    setSelectUser(users ? JSON.parse(users) : { name: '', displayName: '' });
  }

  const loadDueFieldFromStore = () => {
    const field = window.localStorage.getItem('due_field');
    setDueField(field ? field : 'Due');
  }

  useEffect(() => {
    loadUserFromStore();
    loadDueFieldFromStore();
  }, []);

  const JQLThisWeek = useMemo(() => {
    return buildJQL(formatSubmitUser(), dueField, selectDate[0], addDays(selectDate[1], 1))
  }, [selectUser, selectDate[0], selectDate[1], dueField]);

  const JQLNextWeek = useMemo(() => {
    return buildJQL(formatSubmitUser(), dueField, addDays(selectDate[0], 7), addDays(selectDate[1], 8))
  }, [selectUser, selectDate[0], selectDate[1], dueField]);

  const searchResultByUser = () => {
    if (!judgeParams()) return;
    logEvent('weekly-report-search',{
      username: selectUser.name, 
      tplName,
    });
    setFetchingSearchResults(true);
    Promise.all([getTasks(JQLThisWeek), getTasks(JQLNextWeek)])
      .then((resArr) => {
        console.log(JSON.stringify(resArr[0]));
        setTaskThisWeek(resArr[0]);
        setModifiedThisWeek('');
        setTaskNextWeek(resArr[1]);
        setModifiedNextWeek('');
      })
      .finally(() => {
        setFetchingSearchResults(false);
      });
  };

  const judgeParams = () => {
    if (!selectDate[0] || !selectDate[1] || !selectUser) {
      return false;
    }
    return true;
  };

  function onTplChange(name: string, template: string) {
    setTplName(name);
    setTplContent(template);
    setLocalTpl({ name, template });
  }

  const translate2EN = (event: React.MouseEvent<HTMLButtonElement>) => {
    google.script.run
      .withSuccessHandler((text) => {
        setThoughtsEN(text);
      })
      .translateZH2EN(thoughtsCN);
  }

  const translate2ZH = (event: React.MouseEvent<HTMLButtonElement>) => {
    google.script.run
      .withSuccessHandler((text) => {
        setThoughtsCN(text);
      })
      .translateEN2ZH(thoughtsEN);
  }

  useEffect(() => {
    debounce(translate2ZH)();
  }, [thoughtsEN]);

  const handleCNChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    event && setThoughtsCN(event.target.value);
  }

  const handleENChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    event && setThoughtsEN(event.target.value);
  }

  const generateReport = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsEditing(false);
    thisWeekRef.current && setModifiedThisWeek(thisWeekRef.current.innerHTML);
    nextWeekRef.current && setModifiedNextWeek(nextWeekRef.current.innerHTML);
  }

  const handleSearch = () => {
    google.script.run
      .withSuccessHandler((text) => {
        setWordEN(text);
      })
      .translateZH2EN(wordZH);
  }

  const handleWordChange = (event: any) => {
    event && setWordZH(event.target.value)
  }

  const handleDueFieldChange = (event: SelectChangeEvent) => {
    setDueField(event.target.value as string);
    window.localStorage.setItem('due_field', event.target.value as string);
  };

  const renderDueField = () => {
    return (
      <>
        <Select
          size="small"
          sx={{ marginLeft: '20px' }}
          value={dueField}
          onChange={handleDueFieldChange}
        >
          <MenuItem value={"Due"}>use "Due"</MenuItem>
          <MenuItem value={"Dev Due Date"}>use "Dev Due Date"</MenuItem>
          <MenuItem value={"Planned Dev Due Date"}>use "Planned Dev Due Date"</MenuItem>
        </Select>
      </>
    )
  }

  return (
    <Stack>
      <Box sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <AssigneeAutocomplete
          value={selectUser}
          style={{ marginBottom: '10px' }}
          label="Please Select User"
          onChange={(event, value: User) => {
            setUsersToStore(value);
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
              <>
                <TextField {...startProps} size="small" />
                <Box sx={{ mx: 2 }}> to </Box>
                <TextField {...endProps} size="small" />
                {renderDueField()}
              </>
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
          <JqlDisplay jql={JQLThisWeek} />
        </Stack>
      </Box>
      <Box>
        <ReportTemplate data={taskThisWeek.concat(taskNextWeek)} value={tplName} onChange={onTplChange} />
      </Box>
      <Box>
        <h2>Work this week</h2>
        {/* {modifiedThisWeek &&
          <ul
            contentEditable="true"
            ref={thisWeekRef}
            dangerouslySetInnerHTML={{ __html: modifiedThisWeek }}
          />} */}

        {
          !modifiedThisWeek && taskThisWeek && (
            <div ref={thisWeekRef} dangerouslySetInnerHTML={{ __html: renderTasks(tplContent, taskThisWeek) }} >
            </div>
          )
        }
        <h2>Plan for next week</h2>
        {/* {modifiedNextWeek &&
          <ul
            contentEditable="true"
            ref={nextWeekRef}
            dangerouslySetInnerHTML={{ __html: modifiedNextWeek }}
          />} */}
        {
          !modifiedNextWeek && taskNextWeek && (
            <div ref={nextWeekRef} dangerouslySetInnerHTML={{ __html: renderTasks(tplContent, taskNextWeek) }} >
            </div>
          )
        }
      </Box>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '60px',
        marginTop: '0',
        marginBottom: '0',
      }}>
        <TextField label="中->英" size="small" value={wordZH} onChange={handleWordChange} />
        <Button onClick={handleSearch} size="small">查找</Button>
        <p>{wordEN}</p>
      </Box>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '30px',
        marginTop: '20px',
      }}>
        <h2>My thoughts</h2>
        <Button variant="outlined" onClick={translate2ZH}>translate</Button>
      </Box>
      <TextField
        multiline
        minRows={5}
        style={{ marginTop: '2px', marginBottom: '5px' }}
        value={thoughtsEN}
        onChange={handleENChange}
        placeholder={"To improve your writing skills, try to write in English first :-)"}
      />
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '30px',
        marginTop: '10px',
      }}>
        <h2>思考</h2>
        <Button variant="outlined" onClick={translate2EN}>翻译</Button>
      </Box>
      <TextField
        multiline
        minRows={5}
        style={{ marginTop: '5px', marginBottom: '5px' }}
        value={thoughtsCN}
        onChange={handleCNChange}
      />
      <Box style={{
        display: 'flex',
        flexDirection: 'row-reverse'
      }}>
        <Button
          variant="contained"
          onClick={generateReport}
          style={{ marginTop: '15px' }}
        >Generate
        </Button>
      </Box>
    </Stack>
  )
}

export default EditReport;
