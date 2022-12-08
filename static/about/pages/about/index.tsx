import React from 'react';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Link from '@mui/material/Link';

const About = () => {
  return (
    <div>
      <section>
        <Typography variant="h6">Version :{VERSION}</Typography>
      </section>
      <Divider style={{ marginTop: 12, marginBottom: 12 }} />
      <section>
        <Typography variant="h6">About</Typography>
        <Typography variant="body1">
          This is a sheets plugin that provides users with data synchronization
          between Jira and sheets
        </Typography>
      </section>
      <Divider style={{ marginTop: 12, marginBottom: 12 }} />
      <section>
        <Typography variant="h6">Features</Typography>
        <List>
          <ListItem disablePadding>
            <ListItemText
              primary="Import tasks/sbutasks from Jira to the Google sheets, and sync schedules between Google sheets and Jira."
            />
          </ListItem>
          <ListItem disablePadding>
            <ListItemText
              primary="Batch update task score."
            />
          </ListItem>
          <ListItem disablePadding>
            <ListItemText
              primary="Generate weekly report"
            />
          </ListItem>
        </List>
      </section>
      <Divider style={{ marginTop: 12, marginBottom: 12 }} />
      <section>
        <Link
          href="https://confluence.domain.io/pages/viewpage.action?pageId=873453815"
          target="_blank"
        >
          Please see the documentation for more details on how to use it.
        </Link>
      </section>
      <Typography
        variant="body2"
        style={{
          bottom: 0,
          textAlign: 'center',
          verticalAlign: 'middle',
          position: 'fixed',
          width: '100%',
        }}
      >
        Target File Assistant 2021 Created by domain Listing QC FE
      </Typography>
    </div>
  );
};

export default About;
