const MongoClient = require('mongodb').MongoClient

class Connection {
    static connectToMongo() {
        if (this.db) return Promise.resolve(this.db)
        return MongoClient.connect(this.url, this.options)
            .then(client => this.db = client.db('game-dev-tycoon'))
    }
}

Connection.db = null
Connection.url = 'mongodb://user:password@127.0.0.1:27017/?authSource=admin'
Connection.options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

module.exports = Connection