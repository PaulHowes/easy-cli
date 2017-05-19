#!/usr/bin/env node
'use strict'
const Parser = require('..')

var args = Parser
    .title('fakezip')
    .help('Compresses files and directories into an archive')
    .version('3.14')
    .option('fast', {
        short: '1',
        help:  'Fastest (worst) compression'
    })
    .option('best', {
        short: '9',
        help:  'Best (slowest) compression'
    })
    .option('comment', {
        short: 'c',
        meta:  'comment',
        help:  'Adds a comment to the zip file.'
    })
    .option('files', {
        meta:  'files',
        help:  'Files to compress are read from {files} instead of being listed on the command line.'
    })
    .parse()
console.log(args)
