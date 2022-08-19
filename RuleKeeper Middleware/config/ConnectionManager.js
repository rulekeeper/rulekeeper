let mongooseConnection;

module.exports = {
    setConnection(connection) {
        mongooseConnection = connection;
    },
    getConnection() {
        return mongooseConnection;
    }
}
