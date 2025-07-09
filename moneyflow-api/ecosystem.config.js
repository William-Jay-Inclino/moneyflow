module.exports = {
    apps: [
        {
            name: 'moneyflow-api',
            script: './scripts/start_moneyflow.sh',
            cwd: __dirname, 
            listen_timeout: 10000,
        },
    ]
};
