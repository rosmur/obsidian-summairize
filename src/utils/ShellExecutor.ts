import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ShellExecutor {
  private static readonly TIMEOUT = 30000; // 30 seconds

  static async execute(command: string): Promise<string> {
    try {
      // Set up environment with common paths where ollama might be installed
      const env = {
        ...process.env,
        PATH: [
          process.env.PATH,
          '/usr/local/bin',
          '/opt/homebrew/bin',
          '/usr/bin',
          '/bin',
          '/usr/sbin',
          '/sbin',
          process.env.HOME + '/.local/bin'
        ].filter(Boolean).join(':')
      };

      const { stdout, stderr } = await execAsync(command, {
        timeout: this.TIMEOUT,
        maxBuffer: 1024 * 1024, // 1MB buffer
        env: env
      });

      if (stderr && stderr.trim()) {
        console.warn('Shell command stderr:', stderr);
      }

      return stdout.trim();
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new Error('Command not found. Please ensure the required software is installed.');
      } else if (error.signal === 'SIGTERM') {
        throw new Error('Command timed out. Please try again.');
      } else {
        throw new Error(`Command failed: ${error.message}`);
      }
    }
  }

  static async checkCommand(command: string): Promise<boolean> {
    try {
      // Try multiple ways to check if command exists
      const checks = [
        `which ${command}`,
        `command -v ${command}`,
        `type ${command}`
      ];
      
      for (const check of checks) {
        try {
          await this.execute(check);
          return true;
        } catch {
          continue;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  static escapeShellArg(arg: string): string {
    // Escape single quotes and wrap in single quotes
    return `'${arg.replace(/'/g, "'\"'\"'")}'`;
  }
}
