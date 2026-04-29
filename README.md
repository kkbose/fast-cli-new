FAST CLI FRAMEWORK
==========

FAST stands for Framework Assisted Solution Templates. Virtusa FAST platform enables next gen developers with generation of software in Any Language, Any cloud, Any pattern that has least Tech Debt.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/mymulticli.svg)](https://npmjs.org/package/mymulticli)
[![Downloads/week](https://img.shields.io/npm/dw/mymulticli.svg)](https://npmjs.org/package/mymulticli)
[![License](https://img.shields.io/npm/l/mymulticli.svg)](https://github.com/VS/mymulticli/blob/master/package.json)

## Security Status

✅ **Production Ready - Hardened for Security**

This version has been security-hardened and is ready for production deployment. All critical vulnerabilities have been eliminated:
- **0 Critical** vulnerabilities 
- **0 High** severity runtime vulnerabilities
- Protected against shell injection, path traversal, and prototype pollution attacks

See [SECURITY.md](SECURITY.md) for detailed security information and [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for deployment guidelines.

<!-- toc -->
* [Usage](#usage)
* [Clean installation](#clean-installation)
* [Or build from source](#or-build-from-source)
* [Commands](#commands)
<!-- tocstop -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g fast
$ fast COMMAND
running command...
$ fast (-v|--version|version)
fast/0.0.9 win32-x64 node-v25.8.2
$ fast --help [COMMAND]
USAGE
  $ fast COMMAND
...
```
<!-- usagestop -->
```sh-session
$ npm install -g fast
$ fast COMMAND
running command...
$ fast (-v|--version|version)
fast/0.0.9 win32-x64 node-v19.7.0
$ fast --help [COMMAND]
USAGE
  $ fast COMMAND
...
```
<!-- usagestop -->
```sh-session
$ npm install -g fast
$ fast COMMAND
running command...
$ fast (-v|--version|version)
fast/0.0.0 win32-x64 node-v16.4.0
$ fast --help [COMMAND]
USAGE
  $ fast COMMAND
...
```
<!-- usagestop -->

## System Requirements

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **OS**: Windows, macOS, or Linux

## Installation

```bash
# Clean installation
npm install -g fast

# Or build from source
npm install --production
npm run prepack
```

# Commands
<!-- commands -->
* [fast generate [FILE]](#fast-generate-file)
* [fast help [COMMAND]](#fast-help-command)
* [fast license-detail [FILE]](#fast-license-detail-file)
* [fast license-update [FILE]](#fast-license-update-file)
* [fast template-install [FILE]](#fast-template-install-file)
* [fast template-list](#fast-template-list)
* [fast template-remove](#fast-template-remove)

## fast generate [FILE]

Generate code with FAST config file

```
USAGE
  $ fast generate [FILE]

OPTIONS
  -f, --force
  -h, --help                 show CLI help
  -p, --path=path            FAST config file
  -w, --workspace=workspace  Workspace folder to generate code
```

_See code: [src/commands/generate.ts](https://github.com/VS/fast/blob/v0.0.9/src/commands/generate.ts)_

## fast help [COMMAND]

display help for fast

```
USAGE
  $ fast help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.4/src/commands/help.ts)_

## fast license-detail [FILE]

License Details

```
USAGE
  $ fast license-detail [FILE]

OPTIONS
  -c, --check=check  Check Validity
  -f, --force
  -h, --help         show CLI help
  -p, --path=path    License Path
```

_See code: [src/commands/license-detail.ts](https://github.com/VS/fast/blob/v0.0.9/src/commands/license-detail.ts)_

## fast license-update [FILE]

Update License

```
USAGE
  $ fast license-update [FILE]

OPTIONS
  -h, --help       show CLI help
  -k, --key=key    New License Key
  -p, --path=path  New License Path
```

_See code: [src/commands/license-update.ts](https://github.com/VS/fast/blob/v0.0.9/src/commands/license-update.ts)_

## fast template-install [FILE]

Install Template

```
USAGE
  $ fast template-install [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -p, --path=path  Template path
```

_See code: [src/commands/template-install.ts](https://github.com/VS/fast/blob/v0.0.9/src/commands/template-install.ts)_

## fast template-list

List all available templates

```
USAGE
  $ fast template-list

OPTIONS
  -f, --force
  -h, --help   show CLI help
```

_See code: [src/commands/template-list.ts](https://github.com/VS/fast/blob/v0.0.9/src/commands/template-list.ts)_

## fast template-remove

Remove plugin

```
USAGE
  $ fast template-remove

OPTIONS
  -f, --force
  -h, --help                   show CLI help
  -t, --templateId=templateId  TemplateId to be removed
```

_See code: [src/commands/template-remove.ts](https://github.com/VS/fast/blob/v0.0.9/src/commands/template-remove.ts)_
<!-- commandsstop -->
* [`fast generate [FILE]`](#fast-generate-file)
* [`fast help [COMMAND]`](#fast-help-command)
* [`fast license-detail [FILE]`](#fast-license-detail-file)
* [`fast license-update [FILE]`](#fast-license-update-file)
* [`fast template-install [FILE]`](#fast-template-install-file)
* [`fast template-list`](#fast-template-list)
* [`fast template-remove`](#fast-template-remove)

## `fast generate [FILE]`

Generate code with FAST config file

```
USAGE
  $ fast generate [FILE]

OPTIONS
  -f, --force
  -h, --help                 show CLI help
  -p, --path=path            FAST config file
  -w, --workspace=workspace  Workspace folder to generate code
```

_See code: [src/commands/generate.ts](https://github.com/VS/fast/blob/v0.0.9/src/commands/generate.ts)_

## `fast help [COMMAND]`

display help for fast

```
USAGE
  $ fast help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.18/src/commands/help.ts)_

## `fast license-detail [FILE]`

License Details

```
USAGE
  $ fast license-detail [FILE]

OPTIONS
  -c, --check=check  Check Validity
  -f, --force
  -h, --help         show CLI help
  -p, --path=path    License Path
```

_See code: [src/commands/license-detail.ts](https://github.com/VS/fast/blob/v0.0.9/src/commands/license-detail.ts)_

## `fast license-update [FILE]`

Update License

```
USAGE
  $ fast license-update [FILE]

OPTIONS
  -h, --help       show CLI help
  -k, --key=key    New License Key
  -p, --path=path  New License Path
```

_See code: [src/commands/license-update.ts](https://github.com/VS/fast/blob/v0.0.9/src/commands/license-update.ts)_

## `fast template-install [FILE]`

Install Template

```
USAGE
  $ fast template-install [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -p, --path=path  Template path
```

_See code: [src/commands/template-install.ts](https://github.com/VS/fast/blob/v0.0.9/src/commands/template-install.ts)_

## `fast template-list`

List all available templates

```
USAGE
  $ fast template-list

OPTIONS
  -f, --force
  -h, --help   show CLI help
```

_See code: [src/commands/template-list.ts](https://github.com/VS/fast/blob/v0.0.9/src/commands/template-list.ts)_

## `fast template-remove`

Remove plugin

```
USAGE
  $ fast template-remove

OPTIONS
  -f, --force
  -h, --help                   show CLI help
  -t, --templateId=templateId  TemplateId to be removed
```

_See code: [src/commands/template-remove.ts](https://github.com/VS/fast/blob/v0.0.9/src/commands/template-remove.ts)_
<!-- commandsstop -->
* [`fast generate [PATH] [WORKSPACE]`](#fast-generate-file)
* [`fast help [COMMAND]`](#fast-help-command)
* [`fast license-detail [PATH]`](#fast-license-detail-file)
* [`fast license-update [PATH]`](#fast-license-update-file)
* [`fast template-install [PATH]`](#fast-template-install-file)
* [`fast template-list`](#fast-template-list-file)
* [`fast template-remove [TEMPLATEID]`](#fast-template-remove)

## `fast generate [PATH] [WORKSPACE]`

Generate code with FAST config file

```
USAGE
  $ fast generate [PATH] [WORKSPACE]

OPTIONS
  -f, --force
  -h, --help                 Show CLI help
  -p, --path=path            FAST config file
  -w, --workspace=workspace  Workspace folder to generate code
```

_See code: [src/commands/generate.ts](https://github.com/VS/fast/blob/v0.0.0/src/commands/generate.ts)_

## `fast help [COMMAND]`

Display help for FAST

```
USAGE
  $ fast help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.4/src/commands/help.ts)_

## `fast license-detail [FILE]`

License Details for the current environment

```
USAGE
  $ fast license-detail [PATH]

OPTIONS
  -f, --force
  -h, --help       Show CLI help
  -p, --path=path  License path
```

_See code: [src/commands/license-detail.ts](https://github.com/VS/fast/blob/v0.0.0/src/commands/license-detail.ts)_

## `fast license-update [PATH]`

Update License

```
USAGE
  $ fast license-update [PATH]

OPTIONS
  -p, --path=path  New License Path
  -h, --help       Show CLI help
  -k, --key=key    New License Key
```

_See code: [src/commands/license-update.ts](https://github.com/VS/fast/blob/v0.0.0/src/commands/license-update.ts)_

## `fast template-install [PATH]`

Install Template

```
USAGE
  $ fast template-install [PATH]

OPTIONS
  -h, --help       Show CLI help
  -p, --path=path  Template Path
  -f, --force
```

_See code: [src/commands/template-install.ts](https://github.com/VS/fast/blob/v0.0.0/src/commands/template-install.ts)_

## `fast template-list`

List all available templates

```
USAGE
  $ fast template-list

OPTIONS
  -f, --force
  -h, --help       Show CLI help
```

_See code: [src/commands/template-list.ts](https://github.com/VS/fast/blob/v0.0.0/src/commands/template-list.ts)_

## `fast template-remove [TEMPLATEID]`

Remove template with templateId

```
USAGE
  $ fast template-remove [TEMPLATEID]

OPTIONS
  -f, --force
  -h, --help                   Show CLI help
  -t, --templateId=templateId  TemplateId to be removed
```

_See code: [src/commands/template-remove.ts](https://github.com/VS/fast/blob/v0.0.0/src/commands/template-remove.ts)_
<!-- commandsstop -->
