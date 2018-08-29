import commander = require('commander');

commander.Command.prototype.forwardSubcommands = function (): any {
  const listener = (args: any[], unknown: any[]) => {
    // tslint:disable:no-parameter-reassignment
    // Parse any so-far unknown options
    args = args || [];
    unknown = unknown || [];

    const parsed = this.parseOptions(unknown);
    if (parsed.args.length) args = parsed.args.concat(args);
    unknown = parsed.unknown;

    // Output help if necessary
    if (unknown.includes('--help') || unknown.includes('-h')) {
      this.outputHelp();
      process.exit(0);
    }

    this.parseArgs(args, unknown);
    // tslint:enable:no-parameter-reassignment
  };

  if (this._args.length > 0) {
    console.error('forwardSubcommands cannot be applied to command with explicit args');
  }

  const parent = this.parent || this;
  const name = parent === this ? '*' : this._name;
  parent.on('command:' + name, listener);
  if (this._alias) {
    parent.on('command:' + this._alias, listener);
  }
  return this;
};