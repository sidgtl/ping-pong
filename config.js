module.exports = {
    development: {
        clientUrl: 'localhost',
        clientPort: 8000,
        wsPort: 8080,
        cardReaderPort: 4000,
        database: {
            client: 'mysql',
            connection: {
                host: 'localhost',
                port: 3306,
                user: 'root',
                password: '!abc123!',
                database: 'ping_pong',
            },
            migrations: {
                directory: __dirname + '/migrations',
                tableName: 'migrations'
            }
        }
    },
    production: {
        clientUrl: undefined,
        clientPort: undefined,
        wsPort: undefined,
        database: {
            client: 'mysql',
            connection: {
                host: undefined,
                port: undefined,
                user: undefined,
                password: undefined,
                database: undefined,
            },
            migrations: {
                directory: __dirname + '/migrations',
                tableName: 'migrations'
            }
        },
        cardReaderPort: undefined
    },
    global: {
        sparkCore: {
            accessToken: undefined,
            id: undefined
        },
        serverSwitchLimit: 5, // How many points before service switches
        serverSwitchThreshold: 20, // When both players have reached this threshold, the server switches every time
        maxScore: 21,
        mustWinBy: 2,
        minPlayers: 2,
        maxPlayers: 2,
        winningViewDuration: 12000, // The duration to show the winning view for before returning to the leaderboard
        feelers: {
            pingInterval: 5000,
            pingThreshold: 250,
            undoThreshold: 1500
        },
        cardReader: {
            pingInterval: 30000,
            pingThreshold: 250
        }
    }
};