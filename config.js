module.exports = {
    development: {
        clientUrl: 'http://localhost',
        clientPort: 82,
        wsPort: 2000,
        cardReaderPort: 123,
        database: {
            client: 'mysql',
            connection: {
                host: 'localhost',
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
                host: 'localhost',
                port: 3306,
                user: 'root',
                password: 'root',
                database: 'ballgame',
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
