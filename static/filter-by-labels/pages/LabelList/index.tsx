import { LoadingButton } from '@mui/lab';
import { Box, Button, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Stack } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { LABELS } from '../../constants/labels';
export default function index() {
    const [loading, setLoading] = useState(false);
    const [labels, setLabels] = useState(LABELS);
    const [checkdLabels, setCheckdLabels] = useState<{ [x: string]: boolean }>({});
    const filterTaskByLabels = (selected: string[]) => {
        return new Promise((resolve, reject) => {
            google.script.run
                .withSuccessHandler((result: string) => {
                    resolve(result);
                })
                .withFailureHandler((error, object) => {
                    reject({
                        error,
                        object,
                    })
                }).filterTaskByLabels(JSON.stringify(selected),'AND')
        })
    }
    const getLabelsFromSheet = (): Promise<string[]> => {
        return new Promise((resolve, reject) => {
            google.script.run
                .withSuccessHandler((labelsJson: string) => {
                    const labels = JSON.parse(labelsJson)
                    resolve(labels)
                })
                .withFailureHandler((error, object) => {
                    reject({
                        error,
                        object,
                    })
                }).extractLabels()
        })
    }

    const handleChange = (label: string) => {
        setCheckdLabels({
            ...checkdLabels,
            [label]: !checkdLabels[label]
        });
    }

    const filterTasks = async () => {
        let selected = labels.filter(p => checkdLabels[p]);
        console.log(selected)
        await filterTaskByLabels(selected);
    }

    const removeAll = () => {
        google.script.run
            .withSuccessHandler((labelsJson: string) => {
                setCheckdLabels({})
            })
            .withFailureHandler((error, object) => {
            }).removeFilters()
    }

    const initLabels = async () => {
        setLoading(true);
        const labels = await getLabelsFromSheet();
        setLabels(labels);
        setLoading(false);
    }


    useEffect(() => {
        // initLabels();
    }, [])

    useEffect(() => {

        filterTasks()
    }, [checkdLabels])

    return (
        <Stack
            direction="column"
            justifyContent="space-between"
            alignItems="stretch"
            spacing={0}
            sx={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                fontSize: '0.875rem',

            }}
        >
            <Box sx={{ flex: 'auto', overflow: 'auto' }}>
                <Box sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 8,
                    bgcolor: 'background.paper',
                    height: 40,
                    lineHeight: '40px',
                    padding: '0 10px'
                }} >Labels</Box>
                {/* <Box display="flex" justifyContent="center" alignItems="center">
                    {loading && 'loading...'}
                </Box>
                {
                    !loading && (
                        <FormControl sx={{ m: 1 }} component="div" variant="standard">
                            <FormGroup sx={{ flexDirection: 'row' }}>
                                {LABELS.map((label) => {
                                    return (
                                        <FormControlLabel
                                            control={
                                                <Checkbox checked={!!checkdLabels[label]} onChange={handleChange.bind(this, label)} name={label} />
                                            }
                                            label={label}
                                        />
                                    )
                                })}
                            </FormGroup>
                        </FormControl>
                    )
                } */}
                <FormControl sx={{ m: 1 }} component="div" variant="standard">
                    <FormGroup sx={{ flexDirection: 'row' }}>
                        {labels.map((label) => {
                            return (
                                <FormControlLabel
                                    control={
                                        <Checkbox checked={!!checkdLabels[label]} onChange={handleChange.bind(this, label)} name={label} />
                                    }
                                    label={label}
                                />
                            )
                        })}
                    </FormGroup>
                </FormControl>
            </Box>
            <Stack
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
                spacing={0.5}
                sx={{ padding: '8px 16px', borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}
            >
                <Box sx={{ flex: 'auto', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {/*{selectedCount} tasks selected.*/}
                </Box>
                {/* <LoadingButton
                    variant="contained"
                    loadingPosition="start"
                    loading={loading}
                    size={'small'}
                    onClick={initLabels}
                >
                    Refresh Labels
                </LoadingButton> */}
                <Button
                    variant="contained"
                    size={'small'}
                    onClick={removeAll}
                >
                    Remove All
                </Button>
            </Stack>
        </Stack>
    )
}

