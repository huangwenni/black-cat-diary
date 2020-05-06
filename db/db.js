const schema = require('./schema');

//数据库的封装
class DAO {
    constructor(collectionName) {
        this.collectionName = collectionName;
    }

    save(conditions, callback) {
        return new schema[this.collectionName](conditions).save(callback);
    }

    del(conditions, callback, isMany) {
        if (isMany) {
            return schema[this.collectionName].deleteMany(conditions, callback);
        } else {
            return schema[this.collectionName].deleteOne(conditions, callback);
        }
    }

    update(conditions, data, callback, isMany) {
        if (isMany) {
            return schema[this.collectionName].updateMany(conditions, data, callback);
        } else {
            return schema[this.collectionName].updateOne(conditions, data, callback);
        }
    }

    find(conditions,callback,isMany) {
        if (isMany) {
            return schema[this.collectionName].find(conditions,callback);
        } else {
            return schema[this.collectionName].findOne(conditions,callback);
        }
    }
}

exports.DAO = DAO;