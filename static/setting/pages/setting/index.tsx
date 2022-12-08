import React, { useCallback, useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { setUserId, setUserProperties, logEvent } from '../../../_share/firebase/analytics';
import { fetchLogin, fetchUserInfo } from '../../api';
import { addUser } from '../../../_share/firebase/user-list'
import { login as loginFirebase } from '../../../_share/firebase/auth'
const Setting = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginMessage, setLoginMessage] = useState<string>('');
  const getUserInfo = useCallback(() => {
    fetchUserInfo().then((res) => {
      if (!res.code) {
        setUsername(res.data.username);
        setPassword(res.data.password);
      } else {
        setLoginMessage(res.message);
      }
    });
  }, []);
  useEffect(() => {
    loginFirebase()
    getUserInfo();
  }, []);

  const handleConfirm = () => {
    if (username && password) {
      fetchLogin({ username, password }).then((res) => {
        setLoginMessage(res.message);
        if (res.code === 0) {
          if (typeof google !== 'undefined') {
            google.script.run.showSuccessToast('Login successfully');
            google.script.host.close();
          }
        }
      });
      loginFirebase().then(() => {
        addUser(username);
        setUserId(username);
        setUserProperties({ username });
        logEvent('login', {
          username
        })
      })
    }
  };

  const handleClose = () => {
    google.script.host.close();
  };
  return (
    <div
      style={{
        padding: '16',
      }}
    >
      <div
        style={{
          // marginRight: 16,
          // marginBottom: 16,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <TextField
          required
          id="outlined-required"
          label="Username"
          value={username}
          style={{ marginBottom: 16 }}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          required
          id="outlined-password-input"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 8 }}>{loginMessage}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          disabled={!username || !password}
          onClick={handleConfirm}
          variant="contained"
        >
          Confirm
        </Button>
        <Button
          style={{ marginLeft: 16 }}
          onClick={handleClose}
          variant="outlined"
        >
          Close
        </Button>
      </div>
      <div>
        If you do not have a username and password, please register first,{' '}
        <a
          target="_blank"
          href="https://jira.domain.io/login.jsp?os_destination=%2Fdefault.jsp"
        >
          Go to Jira
        </a>
      </div>
    </div>
  );
};

export default Setting;
