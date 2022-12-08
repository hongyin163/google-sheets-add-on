const { Version2Client } = require("jira.js");

const client = new Version2Client({
  host: "https://jira.domain.io",
  authentication: {
    basic: {
      username: "hongyin.li@domain.com",
      password: "739451Hm^",
    },
  },
  noCheckAtlassianToken: true,
});
debugger;
client.issues.editIssue(
  {
    issueIdOrKey: "SPML-3436",
    fields:{
      customfield_10100:3
    }
  },
  (res) => {
    console.log(res);
  }
);
