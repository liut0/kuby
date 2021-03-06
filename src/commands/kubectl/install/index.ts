import { ensureDir } from 'fs-extra';
import { maxSatisfying } from 'semver';
import { Arguments, Argv, CommandModule } from 'yargs';

import { RootArguments } from '../../../root-arguments';
import { ExitCode } from '../../../utils/exit-code';
import { Filepathes } from '../../../utils/filepathes';
import { Logger } from '../../../utils/logger';
import { simpleConfirm } from '../../../utils/simple-confirm';
import { kubectlUseCommand } from '../use';
import { downloadKubectl, getLocalVersions, getRemoteVersions } from '../utils/kubectl';

type KubectlInstallArguments = RootArguments & {
  semver: string;
  noInteraction: boolean;
  force: boolean;
};

export const kubectlInstallCommand: CommandModule<RootArguments, KubectlInstallArguments> = {
  command: 'install <semver>',
  describe: 'Install and use a specific version of kubectl (i.e. download it).',

  builder: (argv: Argv<RootArguments>) =>
    (argv
      .positional('semver', {
        description: 'Semver version of the kubectl version to install.',
        type: 'string',
        default: undefined,
      })
      .option('no-interaction', {
        alias: 'n',
        boolean: true,
        default: false,
        description: 'No interaction mode, use default answers.',
      })
      .option('force', {
        alias: 'f',
        boolean: true,
        default: false,
        description: 'Force re-install of a version if already installed.',
      }) as unknown) as Argv<KubectlInstallArguments>,

  async handler(args: Arguments<KubectlInstallArguments>): Promise<void> {
    if (args.getYargsCompletions) {
      return;
    }

    const logger = new Logger('kubectl');
    logger.debug('Install kubectl version');

    await ensureDir(Filepathes.kubectlInstallPath);

    const versions = await getRemoteVersions(logger);
    const installVersion = maxSatisfying(versions, args.semver);

    if (!installVersion) {
      logger.error('The given semver is not available. Use other version or use the refresh command.');
      process.exit(ExitCode.error);
      return;
    }

    if (!args.force && (await getLocalVersions()).includes(installVersion)) {
      logger.info(`v${installVersion} already installed and no force flag set.`);
      await kubectlUseCommand.handler(args);
      return;
    }

    if (!args.noInteraction && !(await simpleConfirm(`Found version v${installVersion}. Process install?`, true))) {
      logger.info('Aborting');
      return;
    }

    await downloadKubectl(installVersion, logger);
    await kubectlUseCommand.handler(args);
  },
};
