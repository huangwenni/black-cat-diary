const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/* 用户的Schema */
const userSchema = new Schema({
    userName: {
        type:String,
        require:true
    },
    password: {
        type:String,
        require:true
    },
    avater:{
        type:String,
        default:'/images/avater.png'
    }
});
/* 日记的Schema */
const diarySchema = new Schema({
    userId:{
        type:String,
        require:true
    },
    title:{
        type:String
    },
    diary:{
        type:String,
    },
    last_change_time:{
        type:Date,
        require:true
    },
    status:{
        type:Number,
        enum:[0,1],//日记状态：0显示 1隐藏
        default:0
    },
    hole:{
        type:Number,
        enum:[0,1],//是否发布到树洞：0否 1是
        default: 0
    }
});
/* 喜欢的Schema */
const loveSchema = new Schema({
    userId:{
        type:String,
        require:true
    },
    loveId:{
        type:Array
    }
});
/* 树洞留言的Schema */
const leaveMsgSchema = new Schema({
   diaryId:{
       type:String,
       require:true
   },
   leaveMsg:{
       type:Array //包含了每条留言的用户id和留言信息
   }
});

const User = mongoose.model('User', userSchema);
const Diary = mongoose.model('Diary',diarySchema);
const Love = mongoose.model('Love',loveSchema);
const LeaveMsg = mongoose.model('LeaveMsg',leaveMsgSchema);

exports.User = User;
exports.Diary = Diary;
exports.Love = Love;
exports.LeaveMsg = LeaveMsg;
