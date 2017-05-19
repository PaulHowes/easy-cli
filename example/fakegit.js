#!/usr/bin/env node
'use strict'
const Parser = require('..')

// global options
Parser
    .title('fakegit')
    .help('Git is a fast, scalable, distributed revision control system with an unusually rich command set that provides both high-level operations and full access to internals.')
    .version('2.71')
    .option('git-dir', {
        help: 'Set the path to the repository. This can also be controlled by setting the GIT_DIR environment variable. It can be an absolute path or relative path to current working directory.'
    })

// Adds the "init" command and its options
Parser.command('init')
.help('Create an empty Git repository or reinitialize an existing one. This command must be executed at the top-level directory of what will become the Git repository.')
.callback((opts) => console.log(opts))
.option('quiet', {
    short: 'q',
    help: 'Only print error and warning messages; all other output will be suppressed.'
})
.option('bare', {
    help: 'Create a bare repository. If GIT_DIR environment is not set, it is set to the current working directory.'
})

Parser.parse()
