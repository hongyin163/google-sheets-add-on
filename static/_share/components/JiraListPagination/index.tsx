/**
 * @file
 * 
 */

import React from 'react'
import Pagination from '@mui/material/Pagination'
import Box from '@mui/material/Box'

export interface Props {
  currentPage?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number) => void
  hide?: boolean
}

export default function (props: Props) {
  const {
    currentPage,
    pageSize,
    total,
    onPageChange,
    hide,
  } = props

  return total > pageSize && !hide ? (
    <Box sx={{padding: '8px', borderTop: '1px solid rgba(0, 0, 0, 0.12)'}}>
      <Pagination
        page={currentPage + 1}
        count={Math.ceil(total / pageSize)}
        onChange={(e, page) => {
          onPageChange(page - 1)
        }}
        size="small"
        sx={{display: 'flex', justifyContent: 'center'}}
      />
    </Box>
  ) : null
}
