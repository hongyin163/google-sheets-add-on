import { Box, Button, Popover, Typography } from '@mui/material';
import React from 'react';

interface IJqlDisplay {
    jql: string;
}

export default function JqlDisplay(props: IJqlDisplay) {
    const { jql } = props;
    const [anchorEl, setAnchorEl] = React.useState(null);

    const showJql = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const hideJql = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <Box>
            <Button size="small" aria-describedby={id} variant="contained" onClick={showJql}>
                Show Jql
            </Button>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={hideJql}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Typography sx={{ p: 2, whiteSpace:'break-spaces' }}>{jql}</Typography>
            </Popover>
        </Box>
    )
}
