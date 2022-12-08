import { Box, Button, Snackbar, Stack } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import AssigneeAutocomplete from '../../../_share/components/AssigneeAutocomplete';
import { User } from '../../../_share/types/global';
import { date2yyyymmdd } from '../../../_share/lib/util';

type Props = {
  thoughtsCN: string;
  thoughtsEN: string;
  modifiedThisWeek: string;
  modifiedNextWeek: string;
  selectUser: User;
  selectDate: Date[];
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

const PreviewReport = ({
  thoughtsCN,
  thoughtsEN,
  modifiedThisWeek,
  modifiedNextWeek,
  selectUser,
  selectDate,
  setIsEditing,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [to, setTo] = useState<User[]>([]);
  const [cc, setCc] = useState<User[]>([]);
  const reportRef = useRef(null);

  const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref,
  ) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setIsOpen(false);
  };

  const copyReport = () => {
    if (reportRef.current) {
      const reportHTML = reportRef.current.innerHTML;
      const listener = (e: any) => {
        e.clipboardData.setData("text/html", reportHTML);
        e.clipboardData.setData("text/plain", reportHTML);
        e.preventDefault();
      }
      document.addEventListener('copy', listener);
      document.execCommand("copy");
      setIsOpen(true);
      document.removeEventListener("copy", listener);
    }
  }

  const sendEmail = () => {
    const dateStr = selectDate.map(date => date2yyyymmdd(date)).join('-');
    const toUsers = to.map(user => user.name).join(';');
    const subject = `${selectUser.displayName} Weekly Report ${dateStr}`;
    const ccUsers = cc.map(user => user.name).join(';');
    const mail = `mailto:${toUsers}?subject=${subject}&cc=${ccUsers}`;
    window.open(mail, '_blank');
  }

  const sendReport = () => {
    copyReport();
    sendEmail();
  }

  const fetchUsersFromStore = () => {
    const to = window.localStorage.getItem('weekly_report_to');
    setTo(to ? JSON.parse(to) : []);
    const cc = window.localStorage.getItem('weekly_report_cc');
    setCc(cc ? JSON.parse(cc) : []);
  }

  const saveTo = (users: User[] = []) => {
    window.localStorage.setItem('weekly_report_to', JSON.stringify(users));
    setTo(users);
  }

  const saveCc = (users: User[] = []) => {
    window.localStorage.setItem('weekly_report_cc', JSON.stringify(users));
    setCc(users);
  }

  useEffect(() => {
    fetchUsersFromStore();
  }, []);

  return (
    <Stack>
      <Box>
        <AssigneeAutocomplete
          value={to}
          style={{ marginBottom: '10px' }}
          multiple={true}
          label="To"
          onChange={(event, value: User[]) => {
            saveTo([...value]);
          }}
          getOptionLabel={(option) => option.displayName}
        />
        <AssigneeAutocomplete
          value={cc}
          style={{ marginBottom: '10px' }}
          multiple={true}
          label="Cc"
          onChange={(event, value: User[]) => {
            saveCc([...value]);
          }}
          getOptionLabel={(option) => option.displayName}
        />
      </Box>
      <Box ref={reportRef}>
        <h4>My thoughts</h4>
        {thoughtsEN ? <p>{thoughtsEN}</p> : null}
        {thoughtsCN ? <p>{thoughtsCN}</p> : null}
        <h4>Work this week</h4>
        <ul dangerouslySetInnerHTML={{ __html: modifiedThisWeek }}></ul>
        <h4>Plan for next week</h4>
        <ul dangerouslySetInnerHTML={{ __html: modifiedNextWeek }}></ul>
      </Box>
      <Box style={{
        display: 'flex',
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        margin: '10px',
      }}>
        <Box style={{ display: 'flex' }}>
          <Button 
            variant="outlined" 
            onClick={copyReport}
            style={{ marginRight: '10px' }}
          >Copy</Button>
          <Button variant="contained" onClick={sendReport}>Copy and Send</Button>
        </Box>
        <Button variant="outlined" onClick={() => setIsEditing(true)}>Back</Button>
        <Snackbar open={isOpen} autoHideDuration={1000} onClose={handleClose}>
          <Alert severity="success" onClose={handleClose}>
            Copied!
          </Alert>
        </Snackbar>
      </Box>
    </Stack>
  )
}

export default PreviewReport;