const yargs = require('yargs');
const {spawn} = require('child_process');

async function onExit(childProcess) {
    return new Promise((resolve, reject) => {
        childProcess.once('exit', (code, signal) => {
            if (code === 0) {
                resolve(undefined);
            } else {
                reject(new Error('Exit with error code: ' + code));
            }
        });
        childProcess.once('error', (err) => {
            reject(err);
        });
    });
}

async function runGanache(network, blocktime) {
    var ganacheArgs = ['ganache-cli'];

    // Network option
    switch (network) {
        case 'bsc-local-testnet':
            ganacheArgs.push(...['-f', 'https://data-seed-prebsc-1-s1.binance.org:8545/', '--chainId', '97']);
            break;
        case 'bsc-local-mainnet':
            ganacheArgs.push(...['-f', 'https://bsc-dataseed.binance.org/', '--chainId', '56']);
            break;
        case 'eth-local-ropsten':
            ganacheArgs.push(
                ...['-f', 'https://ropsten.infura.io/v3/6e5d84ddfd044f44b7b6ae6ec167f3f1', '--chainId', '3']
            );
            break;
    }

    // Automatic block mining time
    if (blocktime) {
        ganacheArgs.push(...['--blockTime', `${blocktime}`]);
    }

    var ganache = spawn('ganache-cli', ganacheArgs, {stdio: [process.stdin, process.stdout, process.stderr]});
    return onExit(ganache);
}

async function main() {
    // Parse input arguments
    const argv = yargs
        .option('network', {
            alias: 'n',
            description: 'Network to fork',
            type: 'string',
        })
        .option('blocktime', {
            alias: 'b',
            description: 'Number of seconds for automatic block mining',
            type: 'number',
        })
        .help()
        .alias('help', 'h').argv;

    await runGanache(argv.network, argv.blocktime);
}

main();
