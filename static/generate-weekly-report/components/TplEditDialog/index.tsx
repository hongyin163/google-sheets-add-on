import { Backdrop, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Stack, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress';
import taskData from './task-data'
import render from '../../templates/render';
import defaultTpl from '../../templates/default';
import { addTpl, getTplByUser } from '../../db/tpls'
import { fetchUserInfo } from '../../jira/user';
import { Task } from '../../../_share/types/global';

type Props = {
    data: Task[];
    visible: boolean;
    onAdd: (name: string, template: string) => void;
    onClose: () => void;
}

export default function index(props: Props) {
    const { visible, data = [], onAdd = () => void 0, onClose } = props;
    const [alert, setAlert] = useState('');
    const [loading, setLoading] = useState(true);
    const [userAccount, setUserAccount] = useState('');
    const [teamName, setTeamName] = useState('');
    const [tplContent, setTplContent] = useState(defaultTpl);
    const renderData = (!data || data.length <= 0) ? taskData : data;
    function onTeamNameChange(event: any) {
        setTeamName(event.target.value);
    }
    function onTplContentChange(event: any) {
        const val = event.target.value;
        setTplContent(val);
    }
    function showAlert(message: string) {
        setAlert(message);
        setTimeout(() => {
            setAlert('');
        }, 1500)
    }

    function handleClose() {
        onClose()
    }
    async function handleSave() {
        if (!teamName) {
            showAlert('Name is required');
            return;
        }
        try {
            setLoading(true);
            await addTpl(teamName, tplContent, userAccount);
        } catch (err) {
            showAlert(err.message);
        }
        onClose();
        onAdd(teamName, tplContent);
        setLoading(false);
    }

    async function loadMyTpl(username: string) {
        const tpl = await getTplByUser(username);
        if (tpl) {
            setTplContent(tpl.template);
            setTeamName(tpl.name)
        }
    }
    async function init() {
        setLoading(true);
        const userInfo = await fetchUserInfo();
        const { username } = userInfo;
        setUserAccount(username);
        await loadMyTpl(username);
        setLoading(false);
    }
    useEffect(() => {
        init();
    }, [])

    if (loading) {
        return (
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={visible}
                onClick={handleClose}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        )
    }
    return (
        <Dialog fullWidth maxWidth="lg" open={visible} onClose={handleClose}>
            <DialogTitle>Edit Team Template</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    You can add a template for your team, all the peoples can see these templates. we use <a target="__blank" href='https://ejs.bootcss.com/#promo'>ejs</a>  as template engine , you can copy template content to your own editor for this one is not very good to use.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Team Name"
                    type="email"
                    value={teamName}
                    fullWidth
                    onChange={onTeamNameChange}
                />
                <Stack direction={'row'} alignItems="stretch" spacing={0.5}>
                    <Box flex={1}>
                        <TextField
                            margin="dense"
                            id="name"
                            label="Template"
                            type="text"
                            multiline
                            rows={20}
                            value={tplContent}
                            fullWidth
                            onChange={onTplContentChange}
                        // variant="standard"
                        />
                    </Box>
                    <Box flex={1}>
                        <TextField
                            margin="dense"
                            id="name"
                            label="Task Data"
                            type="text"
                            multiline
                            rows={20}
                            fullWidth
                            value={JSON.stringify(renderData, null, 4)}
                            disabled
                        />

                    </Box>
                </Stack>
                <Box sx={{ padding: '10px' }}>
                    <div dangerouslySetInnerHTML={{ __html: render(tplContent, renderData) }}>

                    </div>
                </Box>
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    open={!!alert}
                    onClose={handleClose}
                    message={alert}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </DialogActions>
        </Dialog>
    )
}
