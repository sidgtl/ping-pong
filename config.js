module.exports = {
    development: {
        clientUrl: 'http://localhost',
        clientPort: 82,
        wsPort: 2000,
        cardReaderPort: 123,
        database: {
            client: 'mysql',
            connection: {
                host: '0.0.0.0',
                port: 3306,
                user: 'root',
                password: 'secret',
                database: 'pingpong',
            },
            migrations: {
                directory: __dirname + '/migrations',
                tableName: 'migrations'
            }
        }
    },
    production: {
        clientUrl: 'localhost',
        clientPort: 83,
        wsPort: 84,
        database: {
            client: 'mysql',
            connection: {
                host: '0.0.0.0',
                port: 3306,
                user: 'root',
                password: 'secret',
                database: 'pingpong',
            },
            migrations: {
                directory: __dirname + '/migrations',
                tableName: 'migrations'
            }
        },
        cardReaderPort: 123
    },
    global: {
        sparkCore: {
            accessToken: undefined,
            id: undefined
        },
        serverSwitchLimit: 2, // How many points before service switches
        serverSwitchThreshold: 10, // When both players have reached this threshold, the server switches every time
        maxScore: 11,
        mustWinBy: 2,
        minPlayers: 2,
        maxPlayers: 2,
        winningViewDuration: 6000, // The duration to show the winning view for before returning to the leaderboard
        feelers: {
            pingInterval: 3000,
            pingThreshold: 250,
            undoThreshold: 1500
        },
        cardReader: {
            pingInterval: 3000,
            pingThreshold: 250
        }
    }
};
