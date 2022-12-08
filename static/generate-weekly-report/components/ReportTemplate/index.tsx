import { Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { getTpls } from '../../db/tpls'

import TplEditDialog from '../TplEditDialog';
import { Task } from '../../../_share/types/global';

type Props = {
    value: string;
    data: Task[];
    onChange: (value: string, template: string) => void;
}

export default function index(props: Props) {
    const { value, data = [], onChange = () => void 0 } = props;
    const [loading, setLoading] = useState(true);
    const [tpls, setTpls] = useState([]);
    const [tplValue, setTplValue] = useState(value);
    const [tplAddVisible, setTplAddVisible] = useState(false)
    function add() {
        setTplAddVisible(true);
    }
    async function loadTpls() {
        setLoading(true);
        let list = await getTpls();
        console.log(list);
        setTpls(list);
        setLoading(false);
    }
    async function signOut() {
    }
    function onTplChange(event: SelectChangeEvent<string>, value: string) {
        console.log(event.target.value);
        const val = event.target.value;
        setTplValue(val);
        const tpl = tpls.find(p => p.name === val);
        onChange(val, tpl.template);
    }

    function handleClose() {
        setTplAddVisible(false);
    }
    const handleAdd = async (name: string, template: string) => {
        setLoading(true);
        await loadTpls();
        setTplValue(name);
        setLoading(false);
        onChange(name, template);
    }
    useEffect(() => {
        loadTpls();
    }, [])
    if (loading) {
        return (
            <Box sx={{ height: 56, lineHeight: '56px', padding: '0 10px' }}>
                Loading Templates...
            </Box>
        )
    }
    return (
        <Stack
            direction="row"
            alignItems="stretch"
            spacing={0.5}
            sx={{ padding: '8px 0' }}
        >
            <FormControl sx={{ width: '250px' }} size="small">
                <InputLabel id="demo-simple-select-label">Weekly Report Template</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={tplValue}
                    label="Weekly Report Template"
                    onChange={onTplChange}
                >
                    {/* <MenuItem value={''}>None</MenuItem> */}
                    {
                        tpls.map((tpl) => {
                            return (
                                <MenuItem value={tpl.name}>{tpl.name}</MenuItem>
                            )
                        })
                    }
                </Select>
            </FormControl>
            <Button
                variant="text"
                type="submit"
                size="small"
                onClick={add}
            >
                Edit Your Team Template
            </Button>
            {/* <Button
                variant="text"
                type="submit"
                size="small"
                onClick={signOut}
            >
                signOut
            </Button> */}
            {tplAddVisible && (
                <TplEditDialog
                    visible={tplAddVisible}
                    onClose={handleClose}
                    onAdd={handleAdd}
                    data={data}
                />
            )}

        </Stack>

    )
}
