const express = require('express');
const router = express.Router();
const DAO = require('../db/db').DAO;
const Times = require('../main/main').Time;
const CurrentTime = require('../main/main').CurrentTime;
const ObjectId = require('mongodb').ObjectId;
const userDB = new DAO('User');
const diaryDB = new DAO('Diary');
const loveDB = new DAO('Love');
const LeaveMsgDB = new DAO('LeaveMsg');
const multer = require('multer');
const upAvater = multer({dest:'../public/images/upAvater'});
const fs = require('fs');

/* --login page start-- */
router.get('/', function (req, res, next) {
    res.render('login')
});
router.post('/login', function (req, res, next) {
    let obj = {
        userName: req.body.userName,
        password: req.body.password
    };
    userDB.find(obj).then(data => {
        if (data) {
            req.session.login = true;
            req.session.user = data;
            res.send({code: 0, msg: '登陆成功'});
        } else {
            res.send({code: 1, msg: '账号或密码错误'});
        }
    })
});
/* --login page end-- */

/* --register page start-- */
router.get('/register', function (req, res, next) {
    res.render('register')
});
router.post('/register', function (req, res, next) {
    let obj = {
        userName: req.body.userName,
        password: req.body.password
    };
    userDB.find({
        userName: req.body.userName
    })
        .then(data => {
            if (data) {
                res.send({code: 1, msg: '昵称已被注册'});
            } else {
                userDB.save(obj, (err, data) => {
                    if (!err) res.send({code: 0, msg: '注册成功'});
                });
            }
        })
        .catch((err) => {
            console.log(err)
        })
});
/* --register page end-- */

/* --setUp start-- */
router.post('/modify',upAvater.single('setUp_avater'),(req,res,next)=>{
    const userId = req.session.user._id;
    let userName = req.body.setUp_name;
    let password = req.body.setUp_pw;
    let file_type;
    if (req.file&&req.file.mimetype.split('/')[0] == 'image') {
        file_type = '.' + req.file.mimetype.split('/')[1];
    }
    if (file_type){
        fs.rename(req.file.path,req.file.path + file_type,(err)=>{
            if (err) throw err;
            let avater = '/images/upAvater/' + req.file.filename+file_type;
            userDB.update({_id:userId},{userName,password,avater}).then((data)=>{
                userDB.find({_id:userId}).then(data=>{req.session.user = data;res.send({code:0,msg:'更改成功'})});
            })
        })
    }else{
        userDB.update({_id:userId},{userName,password}).then((data)=>{
            userDB.find({_id:userId}).then(data=>{req.session.user = data;res.send({code:0,msg:'更改成功'})});
        })
    }
});
/* --setUp end-- */

/* --index page start--*/
router.get('/index', (req, res, next) => {
    const userData = req.session.user;
    const userId = req.session.user._id;
    const Current = new CurrentTime();

    let day, time, week, title = '', diary = '';
    diaryDB.find({
        userId,
        last_change_time: {
            '$gte': new Date(Current.currentDate() + ' 00:00:00'),
            '$lte': new Date(Current.currentDate() + ' 23:59:59')
        }
    }).then(data => {
        if (data) {
            const format = new Times(data.last_change_time);
            day = format.getDate('YY.MM.DD');
            time = format.getTime();
            week = format.getWeek();
            title = data.title;
            diary = data.diary;
            return diaryDB.find({userId}, null, true)
        } else {
            day = Current.currentDate();
            time = Current.currentTime();
            week = Current.currentWeek();
            return diaryDB.find({userId}, null, true)
        }
    }).then(data => {
        let count;
        let diaryData = [];
        let format, diaryTime;
        data.map((item, index) => {
            format = new Times(item.last_change_time);
            diaryTime = format.getDate('YY.MM.DD') + '&nbsp;&nbsp;&nbsp;' + format.getTime() + '&nbsp;&nbsp;&nbsp;' + format.getWeek();
            diaryData.unshift({...item._doc, diaryTime})
        });

        count = diaryData.length;
        res.render('index', {userData, day, time, week, title, diary, diaryData, count})
    })
});
router.post('/updiary', (req, res, next) => {
    let userId = req.session.user._id;
    let title = req.body.title;
    let diary = req.body.diary;
    const Current = new CurrentTime();
    let last_change_time = new Date();

    const countDay = Current.currentDate() + '&nbsp;&nbsp;&nbsp;' + Current.currentTime() + '&nbsp;&nbsp;&nbsp;' + Current.currentWeek();
    const time = Current.currentTime();

    let findQuery = {
        userId,
        last_change_time: {
            '$gte': new Date(Current.currentDate() + ' 00:00:00'),
            '$lte': new Date(Current.currentDate() + ' 23:59:59')
        }
    };
    diaryDB.find(findQuery).then(data => {
        if (data) {
            return diaryDB.update({_id: data._id}, {title, diary, last_change_time});
        } else {
            return diaryDB.save({userId, title, diary, last_change_time})
        }
    }).then(data => {
        return diaryDB.find(findQuery);
    }).then(data => {
        let id = data._id;
        res.send({code: 0, msg: '更改成功', countDay, time, id});
    }).catch((err) => {
        console.log(err);
    })
});
router.delete('/delete', (req, res, next) => {
    let id = ObjectId(req.query.id);
    diaryDB.del({_id: id}).then(data => res.send({code: 0, msg: '删除成功'}))
});
router.post('/changeStatus', (req, res, next) => {
    let id = ObjectId(req.body.id);
    let status = req.body.status;
    diaryDB.update({_id: id}, {status: status}).then(data => res.send({code: 0, msg: '更改status成功（隐藏/显示）'}))
});
/* --index page end--*/

/* --myHome page start-- */
router.get('/myHome', (req, res, next) => {
    const userId = req.session.user._id;
    let findQuery = {
        userId,
        status: 0
    };
    diaryDB.find(findQuery, {}, true).then(data => {
        let count;
        let diaryData = [];
        let format, diaryTime;
        data.map((item, index) => {
            format = new Times(item.last_change_time);
            diaryTime = format.getDate('YY.MM.DD') + '&nbsp;&nbsp;&nbsp;' + format.getTime() + '&nbsp;&nbsp;&nbsp;' + format.getWeek();
            diaryData.unshift({...item._doc, diaryTime})
        });
        count = diaryData.length;
        res.render('myHome', {
            userData: req.session.user,
            diaryData,
            count
        })
    });
});
/* --myHome page end-- */

/* --Hole page start--*/
router.get('/hole', (req, res, next) => {
    diaryDB.find({hole: 1}, {}, true)
        .then(data => {
            let format, diaryTime;
            let userId = req.session.user._id.toString();
            let result = data.map(item=>{
                return new Promise((resolve => {
                    format = new Times(item.last_change_time);
                    diaryTime = format.getDate('YY.MM.DD') + '&nbsp;&nbsp;&nbsp;' + format.getTime() + '&nbsp;&nbsp;&nbsp;' + format.getWeek();
                    item.diaryTime = diaryTime;
                    userDB.find({_id: ObjectId(item.userId)})
                        .then(data => {
                            item.userName = data.userName;
                            return loveDB.find({userId, loveId: item._id.toString()})
                        })
                        .then(data=>{
                            if (data){
                                item.love = 'true';
                                resolve(item)
                            } else{
                                resolve(item)
                            }
                        });
                }))
            });
            Promise.all(result)
                .then(result => {
                    return new Promise(resolve => {
                        resolve(result)
                    })
                })
                .then(data => {
                    data.reverse();
                    res.render('hole', {
                        userData: req.session.user,
                        diaryData: data
                    });
                })
        })
});
router.post('/changeHole', (req, res, next) => {
    let id = ObjectId(req.body.id);
    let hole = req.body.hole;
    diaryDB.update({_id: id}, {hole}).then(data => res.send({code: 0, msg: '发布成功'}))
});
router.post('/upLove', (req, res, next) => {
    let userId = req.session.user._id.toString();
    let loveId = req.body.id;
    loveDB.find({userId})
        .then(data => {
            if (!data) {
                loveDB.save({userId, loveId});
            } else {
                loveDB.find({userId, loveId})
                    .then(data => {
                        if (!data) {
                            return loveDB.update({userId}, {$push: {loveId: loveId}});
                        } else {
                            return loveDB.update({userId, loveId}, {$pull: {loveId: loveId}});
                        }
                    })
                    .then(data => {
                        res.send({code: 0, msg: '切换成功'})
                    })
            }
        })
});
router.post('/leaveMsg',(req,res,next)=>{
    const userId = req.session.user._id;
    let diaryId = req.body.diaryId;
    let leaveMsg = req.body.leaveMsg;
    LeaveMsgDB.find({diaryId}).then(data=>{
        if (data){
            LeaveMsgDB.update({diaryId},{$push:{leaveMsg:{userId,leaveMsg}}}).then(data=>{res.send({code:0,msg:'留言成功'})});
        }else{
            LeaveMsgDB.save({diaryId,leaveMsg:{userId,leaveMsg}}).then(data=>{res.send({code:0,msg:'留言成功'})});
        }
    });
});
router.get('/showLeave',(req,res,next)=>{
    let diaryId = req.query.id;
    LeaveMsgDB.find({diaryId})
        .then(data => {
            if (data) {
                let result = data.leaveMsg.map((item, index) => {
                    return new Promise((resolve => {
                        let userId = item.userId;
                        userDB.find({_id: ObjectId(userId)}).then(data => {
                            item.userName = data.userName;
                            resolve(item);
                        });
                    }));
                });
                Promise.all(result).then(leaveData=>{
                    res.send({leaveData,msg:'获取留言成功'})
                });
            }
        })
});
/* --Hole page end--*/

/* --signOut start--*/
router.get('/signOut',(req,res,next)=>{
    req.session = null;
    res.send({code:0,msg:'退出成功'})
});

/* --signOut end--*/

module.exports = router;