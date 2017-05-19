[![Build Status](https://travis-ci.org/PaulHowes/easy-cli.svg?branch=master)](https://travis-ci.org/PaulHowes/easy-cli)
[![Coverage Status](https://coveralls.io/repos/github/PaulHowes/easy-cli/badge.svg?branch=master)](https://coveralls.io/github/PaulHowes/easy-cli?branch=master)

# easy-cli

Several command line option parser libraries exist for Node.js, but some of the easiest are no longer under development. This is my attempt at something that is easy to configure and use, and supports both single-function utilities and subcommand-based utilities.

# Dependencies

* NodeJS 7.8.0+
* NPM 4.2.0+

# Installation

To install the library globally:

    npm install -g easy-cli

To add the library to a project:

    npm install --save easy-cli

# Usage

`easy-cli` supports two modes of operation: standalone and command. Standalone is meant for a program with a single purpose, such as the Unix `ls` command, which has various options that control its behavior. Command allows the implementation of programs like `git` that provide subcommands to implement unique functions within a single program.

## Zip Example

The `gzip` program does only one thing, so there are no sub commands, only arguments and file names.

```javascript
#!/usr/bin/env node
'use strict'
const Parser = require('easy-cli')
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
```

The command sends the options to the console:

```
> ./fakezip.js --best --comment="This is a comment" --files=my_files.txt file.zip
{ _: [ 'file.zip' ],
  help: false,
  version: false,
  fast: false,
  best: true,
  comment: 'This is a comment',
  files: 'my_files.txt' }
```

## Git Example

```javascript
#!/usr/bin/env node
'use strict'
const Parser = require('easy-cli')

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
```

The `init` command implements a simple callback that dumps the argumnts to the console:

```
> ./fakegit.js init --bare /foo/bar/baz
{ _: [ '/foo/bar/baz' ],
  help: false,
  version: false,
  'git-dir': false,
  quiet: false,
  bare: true,
  _command: 'init' }
```

# Maintainers

[Paul Howes](http://github.com/PaulHowes/)

# License

`easy-cli` copyright 2017 Paul Howes and is licensed under the
[Apache License](https://github.com/PaulHowes/easy-cli/master/blob/LICENSE)
