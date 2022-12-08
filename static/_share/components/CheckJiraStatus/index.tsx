/**
 * @file
 * 
 */

import React, {
  Fragment,
  FunctionComponent,
  FormEvent,
  useEffect,
  useState,
} from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Stack from '@mui/material/Stack'
import Fade from '@mui/material/Fade'
import CircularProgress from '@mui/material/CircularProgress'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Button from '@mui/lab/LoadingButton'
import { fetchLogin, fetchUserInfo } from '../../../setting/api'
import { login as loginFirebase } from '../../firebase/auth'
// import { logEvent, setUserId, setUserProperties } from '../../firebase/analytics'
export interface Props {
  from: string;
}

export const CheckJiraStatus: FunctionComponent<Props> = function (props) {
  const { children, from } = props
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loginMessage, setLoginMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isProxyReady, setIsProxyReady] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLogging, setIsLogging] = useState(false)
  const logUEvent = (username: string) => {
    // loginFirebase().then(() => {
    //   setUserId(username);
    //   setUserProperties({ username });
    //   logEvent(from, {
    //     module: from,
    //     username
    //   })
    // })
  }
  const getUserInfo = () => {
    setIsLoading(true)
    fetchUserInfo().then((res) => {
      setIsLoading(false)
      setIsProxyReady(true)
      if (!res.code) {
        setIsLoggedIn(true)
        const { username } = res.data;
        logUEvent(username);
      } else {
        setIsLoggedIn(false)
        setLoginMessage(res.message)
      }
    }).catch(() => {
      setIsLoading(false)
      setIsProxyReady(false)
    })
  }


  const login = (e: FormEvent<HTMLFormElement> | undefined) => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }
    setIsLogging(true)
    if (username && password) {
      fetchLogin({ username, password }).then((res) => {
        setIsLogging(false)
        setIsProxyReady(true)
        if (!res.code) {
          setIsLoggedIn(true)
        } else {
          setIsLoggedIn(false)
          setLoginMessage(res.message)
        }
      }).catch(() => {
        setIsLogging(false)
        setIsProxyReady(false)
      })
      logUEvent(username);
    }
  }

  useEffect(() => {
    loginFirebase();
    getUserInfo();

  }, [])

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Fade
          in={isLoading}
          style={{
            transitionDelay: '1000ms',
          }}
          unmountOnExit
        >
          <CircularProgress />
        </Fade>
      </Stack>
    )
  }
  if (isLoggedIn) {
    return <Fragment>{children}</Fragment>
  }
  if (!isProxyReady) {
    return (
      <Alert severity="error">
        <AlertTitle>Jira proxy connection failed.</AlertTitle>
        <Typography>
          <span>Please start/restart the Jira proxy program and </span>
          <Link
            component="button"
            variant="inherit"
            sx={{ fontSize: '1rem' }}
            onClick={getUserInfo}
          >
            RETRY
          </Link>
          .
        </Typography>
        <Typography mt={1}>
          <span>Follow <Link
            target="_blank"
            rel="noopener noreferrer"
            href="https://confluence.domain.io/pages/viewpage.action?pageId=873450737"
          >
            THIS GUIDE
          </Link> to install and launch Jira proxy.</span>
        </Typography>
      </Alert>
    )
  }
  return (
    <Stack spacing={2}>
      {loginMessage ? (
        <Alert severity="warning">{loginMessage}</Alert>
      ) : null}
      <Stack spacing={2} component="form" onSubmit={login} noValidate >
        <TextField
          required
          id="outlined-required"
          label="E-mail"
          value={username}
          autoComplete="email"
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          required
          id="outlined-password-input"
          label="Password"
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="contained"
          type="submit"
          loadingPosition="start"
          loading={isLogging}
          disabled={!username || !password}
          fullWidth
        >
          LOGIN
        </Button>
      </Stack>
      <Alert severity="info">
        <span>If you do not have a username and password, please register first. </span>
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href="https://jira.domain.io/login.jsp?os_destination=%2Fdefault.jsp"
        >
          GO TO JIRA ›
        </Link>
      </Alert>
    </Stack>
  )
}

export default function withJiraStatusCheck<P>(Component: FunctionComponent<P>, name: string = ''): FunctionComponent<P> {
  return function (props) {
    return (
      <CheckJiraStatus from={name}>
        <Component {...props} />
      </CheckJiraStatus>
    )
  }
}
