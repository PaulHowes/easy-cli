'use strict'

const path = require('path')
const process = require('process')

// The parser itself.
class Parser {
    // Default constructor.
    constructor() {
        this._internalInit()
    }

    // Changes the process name seen in `ps`
    title (name) {
        if (!(typeof name === 'string')) {
            throw new TypeError('name must be a string')
        }
        this.name = name
        process.title = name
        return this
    }

    // Adds a command to the parser. Note that the new `Command` object is returned to the caller.
    command (name) {
        if (!(typeof name === 'string')) {
            throw new TypeError('name must be a string')
        }
        const c = new Command(name)
        this.commands[name] = c
        return c
    }

    // Adds a global option to the parser. The parameters are:
    option (name, params) {
        if (!(typeof name === 'string')) {
            throw new TypeError('name must be a string')
        }
        if (!(typeof params === 'object') || params instanceof Array) {
            throw new TypeError('params must be an object')
        }
        if (params === null) {
            params = { }
        }

        params.long = name
        this.options[name] = params
        return this
    }

    // Adds descriptive help to the parser.
    help (str) {
        if (!(typeof str === 'string')) {
            throw new TypeError('str must be a string')
        }
        this.helpText = str
        return this
    }

    // Adds a version number to the "help" output as either a literal string
    // or as a function that returns a string.
    version (obj) {
        if (typeof obj === 'string') {
            this.versionText = obj
        } else if (typeof obj === 'function') {
            this.versionText = obj()
        } else throw new TypeError('obj must be a string or function')
        return this
    }

    // Displays the help by providing the global options first, then recursing through the commands.
    showHelpAndExit (opts) {
        console.log(this._generateHelp());
        process.exit(0)
    }

    // Displays the version.
    showVersionAndExit (opts) {
        console.log(this.versionText)
        process.exit(0)
    }

    // Parses the command line.
    parse (argv) {
        // Options hash returned to the caller.
        var opts = { }
        opts._ = [ ]

        // Fill in all of the global options values as `false`
        for (const name in this.options) {
            opts[name] = false
        }

        // A map of the valid short and long option names, and the long option name that they represent.
        var validOptions = this._validOptionsFromObject(this.options)

        // If arguments were not passed in by the caller, then retrieve them from the command line. The first two
        // strings are removed because they always are the path to Node.js and the path of the running script.
        if (typeof argv === 'undefined' || argv === null) {
            argv = process.argv.slice(2)
        }

        // If the program supports subcommands, then the first option on the command line must be the command.
        if (Object.keys(this.commands).length > 0) {
            // Add the "help" and "version" commands.
            this.command('help')
                .help('Displays help about the program')
            this.command('version')
                .help('Displays the program version')

            const command = argv.shift()
            if (Object.keys(this.commands).includes(command)) {
                // Fill in all of the command options values as `false`
                for (const name in this.commands[command].options) {
                    opts[name] = false
                }

                // Get the full map of valid options.
                Object.assign(validOptions, this._validOptionsFromObject(this.commands[command].options))

                // Save the command name.
                opts._command = command
            } else {
                this.showHelpAndExit()
            }
        }

        // Now the options can be parsed.
        while (argv.length > 0) {
            var option = argv.shift()
            var key = null
            var value = null

            if (option.startsWith('--')) {
                // Process this as a "long" option, e.g. "--option", "--option=value", or "--option value"
                // TODO Add Unit Test for options with a value that contains an '='
                var equalsIndex = option.indexOf('=')
                if (equalsIndex > 0) {
                    // Split the option on the '=' for the key and value to save.
                    key = option.substring(2, equalsIndex)
                    value = option.substring(equalsIndex + 1)
                } else if (argv.length > 0 && !argv[0].startsWith('-')) {
                    // Next string in the argv array is the value.
                    key = option.substring(2)
                    value = argv.shift()
                } else {
                    // The option is a flag.
                    key = option.substring(2)
                    value = true
                }
            } else if (option.startsWith('-')) {
                // Process this as a 'short' option, e.g. "-o" or "-o value"
                key = option.substring(1)
                if (argv.length > 0 && !argv[0].startsWith('-')) {
                    // Next string in the argv array is the value.
                    value = argv.shift()
                } else {
                    // The option is a flag.
                    value = true
                }
            } else {
                // Everything else is added to the '_' member of the object.
                opts._.push(option)
            }

            if (key !== null && value !== null) {
                if(Object.keys(validOptions).includes(key)) {
                    opts[validOptions[key]] = value
                } else {
                    this.showHelpAndExit()
                }
            }
        }

        // Handle the default commands and options
        if (opts.help || opts._command === 'help') {
            this.showHelpAndExit()
        }

        if (opts.version || opts._command === 'version') {
            this.showVersionAndExit()
        }

        // If there was a command and a callback was specified, invoke it now.
        if (Object.keys(this.commands).length > 0 && typeof this.commands[opts._command].cb === 'function') {
            this.commands[opts._command].cb(opts)
        }

        return opts
    }

    // Builds a map of valid options.
    _validOptionsFromObject (o) {
        var validOptions = { }
        for (const name in o) {
            validOptions[name] = name
            const short = o[name].short
            if (typeof short !== 'undefined' && short !== null) {
                validOptions[short] = name
            }
        }
        return validOptions
    }

    // Internal method that resets the parser to its initial state.
    _internalInit () {
        // Stores subcommands and their options.
        this.commands = {}

        // Stores global options.
        this.options = {}

        // Sets the title of the process to the name of the script.
        this.title(path.basename(process.argv[1]))
        
        // Adds the global `help` and `version` options
        this.option('help', {
            short: 'h',
            help: 'Displays help about the program.'
        })
        .option('version', {
            help: 'Displays the program version.'
        })
    }

    // An internal method that generates the help text.
    _generateHelp() {
        const hasCommands = Object.keys(this.commands).length > 0;
        const programName = path.basename(process.argv[1])

        // First is the program's help text.
        var h = this._wrapString(this.helpText, 78).join('\n') + '\n\n'

        // The usage string only includes "<command>" if subcommands have been defined.
        h += 'Usage:\n'
        h += '  ' + programName
        if (hasCommands) {
            h += ' <command>'
        }
        h += ' [options]\n\n'

        // Emit the general options.
        if (hasCommands) {
            h += 'General '
        }
        h += 'Options:\n'

        for (const name in this.options) {
            h += this._helpTextForOption(this.options[name])
        }

        // Emit help for each command, if any.
        if (hasCommands) {
            for (const name in this.commands) {
                h += this._helpTextForCommand(this.commands[name])
            }
        }

        return h
    }

    // Internal method that generates the help text for a sub-command.
    _helpTextForCommand(command) {
        const hasOptions = Object.keys(command.options).length > 0
        const programName = path.basename(process.argv[1])
        const helpWrapWidth = 76

        var line = '\n' + programName + ' ' + command.name + '\n\n'
        line += (typeof command.helpText === 'undefined' || command.helpText === null) ? '' : '  ' + this._wrapString(command.helpText, helpWrapWidth).join('\n  ') + '\n\n'
        if (hasOptions) {
            for (const name in command.options) {
                line += this._helpTextForOption(command.options[name])
            }
        }
        return line
    }

    // Internal method that generates the help text for an option
    _helpTextForOption(option) {
        const wrapWidth = 54

        // Indent the line.
        var line = '  '

        // Short option, if defined.
        line += (typeof option.short === 'undefined' || option.short === null) ? '  ' : ('-' + option.short)

        // Long option.
        line += ' --' + option.long

        // Meta variable for option, if defined.
        line += (typeof option.meta === 'undefined' || option.meta === null) ? '' : ' {' + option.meta + '}'

        // Padding between option and help text. If the option text is too long, the help text starts on the next line.
        const padding = '                       '
        line += (line.length < padding.length) ? padding.slice(line.length) : '\n' + padding
        line += (typeof option.help === 'undefined' || option.help === null) ? '' : this._wrapString(option.help, wrapWidth).join('\n' + padding)
        line += '\n'

        return line
    }

    // Internal method that wraps a string into multiple lines with the specified length.
    _wrapString(str, wrapWidth) {
        var lines = ['']
        var line = 0
        const words = str.split(/\s+/g)
        for (const index in words) {
            const word = words[index]
            if (lines[line].length + word.length + 1 < wrapWidth) {
                lines[line] += (lines[line].length > 0) ? ' ' + word : word
            } else {
                line++
                lines[line] = word
            }
        }
        return lines
    }
}

// The command parser.
class Command {
    // Constructor that initializes the `Command` with a name.
    constructor(name) {
        this.name = name
        this.options = { }
    }

    // Adds an option to the commmand.
    option (name, params) {
        if (!(typeof name === 'string')) {
            throw new TypeError('name must be a string')
        }
        if (!(typeof params === 'object') || params instanceof Array) {
            throw new TypeError('params must be an object')
        }
        if (params === null) {
            params = { }
        }
        params.long = name
        this.options[name] = params
        return this
    }

    // Adds descriptive help to the command.
    help (str) {
        if (!(typeof str === 'string')) {
            throw new TypeError('str must be a string')
        }
        this.helpText = str
        return this
    }

    // Adds a function that implements the command.
    callback (cb) {
        if (!(typeof cb === 'function')) {
            throw new TypeError('cb must be a function')
        }
        this.cb = cb
        return this
    }
}

module.exports = new Parser()
