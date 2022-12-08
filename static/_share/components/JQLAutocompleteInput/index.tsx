/**
 * @file
 * 
 */

import React, { ChangeEvent, useEffect } from 'react'
// import { Version2Client } from 'jira.js/out/version2'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { inputLabelClasses } from '@mui/material/InputLabel'
import { outlinedInputClasses } from '@mui/material/OutlinedInput'
// import jiraClient from '../JiraClient'

export interface Props {
  id?: string
  label?: string
  onValidate?: (isValid: boolean, v: string) => void
  value?: string
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  inputProps?: TextFieldProps
  variant?: 'standard' | 'outlined' | 'filled'
  disabled?: boolean
}

export default function (props: Props) {
  const { /*jiraClient,*/ id = `jql_${Math.random()}`, label = 'JQL', value, onChange, onValidate, inputProps = { }, disabled } = props

  const _onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e)
    }
    if (onValidate) {
      const v = e.target.value
      onValidate(!!v, v)
    }
  }

  useEffect(() => {
    if (value && onValidate) {
      onValidate(!!value, `${value}`)
    }
  }, [value])

  return (
    <TextField
      {...inputProps}
      id={id}
      type="text"
      label={label}
      value={value}
      onChange={_onChange}
      variant="outlined"
      fullWidth
      multiline
      maxRows={8}
      size="small"
      disabled={disabled}
      sx={{
        fontSize: '0.875rem',
        [`& .${inputLabelClasses.root}`]: {
          fontSize: '0.875rem',
        },
        [`& .${outlinedInputClasses.root}`]: {
          fontSize: '0.875rem',
        },
      }}
    />
    /*<FormControl variant={variant} sx={{width: '100%'}}>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <OutlinedInput
        {...inputProps}
        id={id}
        type="text"
        value={value}
        onChange={_onChange}
      />
    </FormControl>*/
  )

  /*const { jiraClient, initialValue, inputId, label, onChange, onValidate } = props

  const getSuggestionsRequest = (fieldName: string, fieldValue: string) => {
    return jiraClient.jql.getFieldAutoCompleteForQueryString({ fieldName, fieldValue }).then(data => ({ data }))
  } // `/rest/api/2/jql/autocompletedata/suggestions?fieldName=${fieldName}&fieldValue=${fieldValue}`

  const validationRequest = (jql: string) => {
    return jiraClient.issueSearch.searchForIssuesUsingJql({
      startAt: 0,
      maxResults: 1,
      validateQuery: 'strict',
      fields: ['summary'],
      jql,
    }).then(v => {
      if (onValidate) {
        onValidate(true)
      }
      return v
    }).catch(err => {
      if (onValidate) {
        onValidate(false)
      }
      return err
    })
  } // `/rest/api/2/search?startAt=0&maxResults=1&validateQuery=strict&fields=summary&jql=${jql}`

  const getAutocompleteDataRequest = () => {
    return jiraClient.jql.getAutoComplete()
  } // '/rest/api/2/jql/autocompletedata'

  return (
    <JQLAutocompleteInput
      getAutocompleteDataRequest={getAutocompleteDataRequest}
      getSuggestionsRequest={getSuggestionsRequest}
      inputStyle="ak-field-text"
      initialValue={initialValue}
      inputId={inputId || `input_${setTimeout(() => {}, 0)}`}
      label={label || ''}
      onChange={onChange}
      validationRequest={validationRequest}
    />
  );*/
}
