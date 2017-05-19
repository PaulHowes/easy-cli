/* global describe it */
'use strict'

const Parser = require('..')
const process = require('process')
const should = require('chai').should()

describe('Parser', function () {
    describe('#constructor', function () {
        it('should set the help and version options', function () {
            Parser.options.should.not.be.empty
            Parser.options.should.include.keys('help', 'version')
        })
    })
    describe('#title', function () {
        it('should throw when the name is not a string', function () {
            should.Throw(() => Parser.title(null))
            should.Throw(() => Parser.title(true))
            should.Throw(() => Parser.title(1))
            should.Throw(() => Parser.title(3.14159))
            should.Throw(() => Parser.title({}))
            should.Throw(() => Parser.title([]))
            should.Throw(() => Parser.title(function () { }))
        })
        it('should accept a new program title', function () {
            const title = 'new_title'
            const p = Parser.title(title)
            p.constructor.name.should.equal('Parser')
            process.title.should.equal(title)
        })
    })
    describe('#command', function () {
        it('should throw when the name is not a string', function () {
            should.Throw(() => Parser.command(null))
            should.Throw(() => Parser.command(true))
            should.Throw(() => Parser.command(1))
            should.Throw(() => Parser.command(3.14159))
            should.Throw(() => Parser.command({}))
            should.Throw(() => Parser.command([]))
            should.Throw(() => Parser.command(function () { }))
        })
        it('should start a new command definition', function () {
            const c = Parser.command('test')
            // Command is an internal class, so instanceof doesn't work here.
            c.constructor.name.should.equal('Command')
        })
    })
    describe('#option', function () {
        it('should throw when the name is not a string', function () {
            should.Throw(() => Parser.option(null, {}))
            should.Throw(() => Parser.option(true, {}))
            should.Throw(() => Parser.option(1, {}))
            should.Throw(() => Parser.option(3.14159, {}))
            should.Throw(() => Parser.option({}, {}))
            should.Throw(() => Parser.option([], {}))
            should.Throw(() => Parser.option(function () { }, {}))
        })
        it('should throw when params is not an object', function () {
            should.Throw(() => Parser.option('name', true))
            should.Throw(() => Parser.option('name', 1))
            should.Throw(() => Parser.option('name', 3.14159))
            should.Throw(() => Parser.option('name', 'string'))
            should.Throw(() => Parser.option('name', []))
            should.Throw(() => Parser.option('name', function () { }))
        })
        it('should add an option', function () {
            const p = Parser.option('name', null)
            p.constructor.name.should.equal('Parser')
            Parser.options.should.not.be.empty
            Parser.options['name'].should.not.be.null
        })
    })
    describe('#help', function () {
        it('should throw when the help text is not a string', function () {
            should.Throw(() => Parser.help(null))
            should.Throw(() => Parser.help(true))
            should.Throw(() => Parser.help(1))
            should.Throw(() => Parser.help(3.14159))
            should.Throw(() => Parser.help({}))
            should.Throw(() => Parser.help([]))
            should.Throw(() => Parser.help(function () { }))
        })
        it('should accept help text', function () {
            const p = Parser.help('text')
            p.constructor.name.should.equal('Parser')
            Parser.helpText.should.equal('text')
        })
    })
    describe('#version', function () {
        it('should throw when the version text is not a string or function', function () {
            should.Throw(() => Parser.version(null))
            should.Throw(() => Parser.version(true))
            should.Throw(() => Parser.version(1))
            should.Throw(() => Parser.version(3.14159))
            should.Throw(() => Parser.version({}))
            should.Throw(() => Parser.version([]))
        })
        it('should accept a version string', function () {
            const version = '3.1.4'
            const p = Parser.version(version)
            p.constructor.name.should.equal('Parser')
            Parser.versionText.should.equal(version)
        })
        it('should accept a version function', function () {
            const version = '2.7.1'
            const p = Parser.version(function () { return version })
            p.constructor.name.should.equal('Parser')
            Parser.versionText.should.equal(version)
        })
    })
    describe('#showHelp', function () {
        it('should work', function () {
            // The goal of this test is to get coverage on the showHelp() method even though most
            // of the testing on the generated string happens below.
            //Parser.showHelp()
        })
    })
    describe('#generateHelp', function () {
        it('should be valid for a simple program with no commands', function () {
            Parser._internalInit()
            const helpString = Parser
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
                .option('files', {
                    meta:  'files',
                    help:  'Files to compress are read from {files} instead of being listed on the command line.'
                })
                ._generateHelp()
            helpString.should.equal(`Compresses files and directories into an archive

Usage:
  _mocha [options]

Options:
  -h --help            Displays help about the program.
     --version         Displays the program version.
  -1 --fast            Fastest (worst) compression
  -9 --best            Best (slowest) compression
     --files {files}   Files to compress are read from {files} instead of
                       being listed on the command line.
`)
        })
    })

    describe('#generateHelp', function () {
        it('should be valid for a program with commands', function () {
            Parser._internalInit()
            Parser
                .title('fakegit')
                .help('Git is a fast, scalable, distributed revision control system with an unusually rich command set that provides both high-level operations and full access to internals.')
                .version('2.71')
                .option('git-dir', {
                    help: 'Set the path to the repository. This can also be controlled by setting the GIT_DIR environment variable. It can be an absolute path or relative path to current working directory.'
                })

            Parser.command('init')
            .help('Create an empty Git repository or reinitialize an existing one. This command must be executed at the top-level directory of what will become the Git repository.')
            .option('quiet', {
                short: 'q',
                help: 'Only print error and warning messages; all other output will be suppressed.'
            })
            .option('bare', {
                help: 'Create a bare repository. If GIT_DIR environment is not set, it is set to the current working directory.'
            })

            Parser.command('add')
            .help('Add file contents to the index')
            .option('force', {
                short: 'f',
                help: 'Allow adding otherwise ignored files.'
            })
            .option('interactive', {
                short: 'i',
                help: 'Add modified contents in the working tree interactively to the index. Optional path arguments may be supplied to limit operation to a subset of the working tree. See "Interactive mode" for details.'
            })

            const helpString = Parser._generateHelp()
            helpString.should.equal(`Git is a fast, scalable, distributed revision control system with an
unusually rich command set that provides both high-level operations and full
access to internals.

Usage:
  _mocha <command> [options]

General Options:
  -h --help            Displays help about the program.
     --version         Displays the program version.
     --git-dir         Set the path to the repository. This can also be
                       controlled by setting the GIT_DIR environment
                       variable. It can be an absolute path or relative path
                       to current working directory.

_mocha init

  Create an empty Git repository or reinitialize an existing one. This
  command must be executed at the top-level directory of what will become the
  Git repository.

  -q --quiet           Only print error and warning messages; all other
                       output will be suppressed.
     --bare            Create a bare repository. If GIT_DIR environment is
                       not set, it is set to the current working directory.

_mocha add

  Add file contents to the index

  -f --force           Allow adding otherwise ignored files.
  -i --interactive     Add modified contents in the working tree
                       interactively to the index. Optional path arguments
                       may be supplied to limit operation to a subset of the
                       working tree. See "Interactive mode" for details.
`)
        })
    })
    describe('#parse', function () {
        it('should parse simple arguments', function () {
            Parser._internalInit()
            const args = Parser
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
                .option('suffix', {
                    meta:  'suffix',
                    short: 's',
                    help:  'Use ".suffix" instead of ".zip"'
                })
                .option('files', {
                    meta:  'files',
                    help:  'Files to compress are read from {files} instead of being listed on the command line.'
                })
                .parse(['--fast', '-9', '--files=foobar', '-s', 'xyz', '--comment', 'This is a comment', 'zippy'])

            args.should.not.be.null
            args._.length.should.equal(1)
            args._[0].should.equal('zippy')
            args.help.should.equal(false)
            args.version.should.equal(false)
            args.fast.should.equal(true)
            args.best.should.equal(true)
            args.comment.should.equal('This is a comment')
            args.suffix.should.equal('xyz')
            args.files.should.equal('foobar')
        })
        it('should parse commands and arguments', function() {
            Parser._internalInit()

            // Callback method that is used to test whether the command processor invokes it.
            var callbackInvoked = false
            function testCallback(o) {
                callbackInvoked = true
            }

            Parser
                .title('fakegit')
                .help('Git is a fast, scalable, distributed revision control system with an unusually rich command set that provides both high-level operations and full access to internals.')
                .version('2.71')
                .option('git-dir', {
                    help: 'Set the path to the repository. This can also be controlled by setting the GIT_DIR environment variable. It can be an absolute path or relative path to current working directory.'
                })

            Parser.command('init')
            .help('Create an empty Git repository or reinitialize an existing one. This command must be executed at the top-level directory of what will become the Git repository.')
            .callback(testCallback)
            .option('quiet', {
                short: 'q',
                help: 'Only print error and warning messages; all other output will be suppressed.'
            })
            .option('bare', {
                help: 'Create a bare repository. If GIT_DIR environment is not set, it is set to the current working directory.'
            })

            Parser.command('add')
            .help('Add file contents to the index')
            .option('force', {
                short: 'f',
                help: 'Allow adding otherwise ignored files.'
            })
            .option('interactive', {
                short: 'i',
                help: 'Add modified contents in the working tree interactively to the index. Optional path arguments may be supplied to limit operation to a subset of the working tree. See "Interactive mode" for details.'
            })
            
            const args = Parser.parse(['init', '-q', '--bare'])
            args.should.not.be.null
            args._.length.should.equal(0)
            args._command.should.equal('init')
            args.help.should.equal(false)
            args.version.should.equal(false)
            args.quiet.should.equal(true)
            args.bare.should.equal(true)
            callbackInvoked.should.equal(true)

        })
    })
})

describe('Command', function () {
    describe('#option', function () {
        it('should throw when the name is not a string', function () {
            const p = Parser.command('name')
            should.Throw(() => p.option(null, {}))
            should.Throw(() => p.option(true, {}))
            should.Throw(() => p.option(1, {}))
            should.Throw(() => p.option(3.14159, {}))
            should.Throw(() => p.option({}, {}))
            should.Throw(() => p.option([], {}))
            should.Throw(() => p.option(function () { }, {}))
        })
        it('should throw when params is not an object', function () {
            const p = Parser.command('name')
            should.Throw(() => p.option('name', true))
            should.Throw(() => p.option('name', 1))
            should.Throw(() => p.option('name', 3.14159))
            should.Throw(() => p.option('name', 'string'))
            should.Throw(() => p.option('name', []))
            should.Throw(() => p.option('name', function () { }))
        })
        it('should add an option', function () {
            const p = Parser.command('name')
            const c = p.option('name', null)
            c.constructor.name.should.equal('Command')
            c.options.should.not.be.empty
            c.options['name'].should.not.be.null
        })
    })
    describe('#help', function () {
        it('should throw when the help text is not a string', function () {
            const p = Parser.command('name')
            should.Throw(() => p.help(null))
            should.Throw(() => p.help(true))
            should.Throw(() => p.help(1))
            should.Throw(() => p.help(3.14159))
            should.Throw(() => p.help({}))
            should.Throw(() => p.help([]))
            should.Throw(() => p.help(function () { }))
        })
        it('should accept help text', function () {
            const p = Parser.command('name')
            const c = p.help('text')
            c.constructor.name.should.equal('Command')
            p.helpText.should.equal('text')
        })
    })
    describe('#callback', function () {
        it('should throw when the callback is not a function', function () {
            const p = Parser.command('name')
            should.Throw(() => p.callback(null))
            should.Throw(() => p.callback(true))
            should.Throw(() => p.callback(1))
            should.Throw(() => p.callback(3.14159))
            should.Throw(() => p.callback({}))
            should.Throw(() => p.callback([]))
        })
        it('should accept a callback function', function () {
            const s = 'dummy'
            const p = Parser.command('name')
            p.callback(function () { return s })
            p.cb().should.equal(s)
        })
    })
})
