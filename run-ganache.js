const yargs = require('yargs');
const { spawn } = require("child_process");

async function onExit(childProcess) {
    return new Promise((resolve, reject) => {
      childProcess.once('exit', (code, signal) => {
        if (code === 0) {
          resolve(undefined);
        } else {
          reject(new Error('Exit with error code: '+code));
        }
      });
      childProcess.once('error', (err) => {
        reject(err);
      });
    });
  }

async function main()
{
  // Parse input arguments
  const argv = yargs
      .option('network',
      {
          alias: 'n',
          description: 'Network to fork',
          type: 'string'
      })
      .option('blocktime',
      {
          alias: 'b',
          description: 'Number of seconds for automatic block mining',
          type: 'number'
      })
      .help()
      .alias('help', 'h')
      .argv;

  var ganacheArgs = ['ganache-cli'];

  // Network option
  switch (argv.network)
  {
      case 'local-testnet':
          ganacheArgs.push(...['-f', 'https://data-seed-prebsc-1-s1.binance.org:8545/', '--chainId', '97']);
          break;
      case 'local-mainnet':
          ganacheArgs.push(...['-f', 'https://bsc-dataseed.binance.org/', '--chainId', '56']);
          break;
  }

  // Automatic block mining time
  if (argv.blocktime) {
      ganacheArgs.push(...['--blockTime', `${argv.blocktime}`]);
  }

  var ganache = spawn('ganache-cli', ganacheArgs, {stdio: [process.stdin, process.stdout, process.stderr]});
  await onExit(ganache);
}

main();