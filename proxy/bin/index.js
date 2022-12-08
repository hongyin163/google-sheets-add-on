#!/usr/bin/env node

'use strict';

const program = require('commander');
const initServer = require('./server');

program.version('0.0.1');

// command "list"
program
  .command('start')
  .description('proxy server start')
  .action(() => {
    initServer();
  });

program.parse(process.argv);
