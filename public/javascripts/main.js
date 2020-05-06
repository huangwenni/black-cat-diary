'use strict';

function register() {
    const register = new Vue({
        el: '#register',
        data: {
            isShow: false,
            warn: ''
        },
        methods: {
            pattern() {
                let userName = document.getElementById('name').value;
                let password = document.getElementById('password').value;
                let reg = /^[0-9A-Za-z]{7,}$/;
                if (userName === '') {
                    this.isShow = true;
                    this.warn = '昵称不能为空!'
                } else if (!reg.test(password)) {
                    this.isShow = true;
                    this.warn = '密码必须由大于6位的字母或数字组成!'
                } else if (reg.test(password)) {
                    this.isShow = false;
                }
                if (userName && reg.test(password)) {
                    axios.post('/register', {
                        userName,
                        password
                    }).then(response => {
                        if (response.data.code === 0) {
                            alert('注册成功！');
                            window.location.href = '/';
                        } else if (response.data.code === 1) {
                            alert('昵称已被注册！');
                        }
                    });
                }
            }
        }
    });
}

function login() {
    let userName = document.getElementById('name').value;
    let password = document.getElementById('password').value;
    axios.post('/login', {
        userName,
        password
    }).then(response => {
        if (response.data.code === 0) {
            alert('登陆成功！');
            window.location.href = '/index'
        } else if (response.data.code === 1) {
            alert('账号或密码错误！');
        }
    })
}

let isShow = false;

function setUp() {
    if (!isShow) {
        let box = document.getElementById('setUp');
        box.setAttribute('style', 'display:block');
        isShow = !isShow
    } else {
        let box = document.getElementById('setUp');
        box.setAttribute('style', 'display:none');
        isShow = !isShow
    }
}

function modify() {
    let form = document.getElementById('setUp_form');
    let formData = new FormData(form);
    axios.post('/modify', formData).then(response => {
        if (response.data.code === 0) {
            alert('更改成功！');
            window.location.href = '/index'
        }
    })
}

function diary() {
    const diary = new Vue({
        el: '#index_box',
        data: {
            boxShow: false,
            iconEditor: true,
            ifOpen: '已显示',
        },
        methods: {
            box_show() {
                this.boxShow = !this.boxShow;
            },
            editor_show() {
                this.iconEditor = !this.iconEditor;
                let text = document.getElementById('showDetail').textContent;
                document.getElementById('editor_diary').value = text;
            },
            save() {
                let title = document.getElementById('diary_title').value;
                let diary = document.getElementById('editor_diary').value;
                axios.post('/updiary', {
                    title,
                    diary,
                }).then(response => {
                    if (response.data.code === 0) {
                        window.location.href = '/index';
                    }
                })
            },
            isOpen(e) {
                let ifChecked = e.currentTarget.parentElement.firstElementChild.checked;
                let id = e.currentTarget.parentElement.parentElement.id;
                id = id.split('-')[1];

                function show() {
                    document.getElementById('isShow').style.display = 'block';
                    document.getElementById('isShow').style.animationName = 'show';
                    setTimeout(() => {
                        document.getElementById('isShow').style.display = 'none';
                        document.getElementById('isShow').style.animationName = '';
                    }, 2000);
                }

                if (!ifChecked) {
                    axios.post('/changeStatus', {id, status: 1}).then(response => {
                        if (response.data.code === 0) {
                            show();
                            this.ifOpen = '已隐藏';
                        }
                    })
                } else {
                    axios.post('/changeStatus', {id, status: 0}).then(response => {
                        if (response.data.code === 0) {
                            show();
                            this.ifOpen = '已显示';
                        }
                    })
                }
            },
            del(e) {
                let msg = '确认将此日记删除？';
                let id = e.currentTarget.parentElement.id.split('-')[1];
                if (confirm(msg)) {
                    axios.delete('/delete?id=' + id).then(response => {
                        if (response.data.code === 0) {
                            e.target.parentElement.remove();
                            let count = document.getElementById('diary_count').innerText;
                            document.getElementById('diary_count').innerText = count - 1;
                            alert('删除成功！');
                        }
                    })
                }
            },
            toHole(e) {
                let id = e.currentTarget.parentElement.id.split('-')[1];
                let msg = '确定发布到树洞？';
                if (confirm(msg)) {
                    axios.post('/changeHole', {id, hole: 1}).then(response => {
                        console.log(response.data)
                    })
                }
            }
        }
    })
}

function love(e) {
    let id = e.currentTarget.parentElement.id.split('-')[1];
    axios.post('/upLove', {id})
}

function hole() {
    const hole = new Vue({
        el: '#hole_box',
        data: {
            boxShow: false,
            diaryId: '',
        },
        methods: {
            box_show(e) {
                this.boxShow = !this.boxShow;
                let id = e.currentTarget.parentElement.id.split('-')[1];
                this.diaryId = id;
                axios.get('/showLeave/?id=' + id).then(response => {
                    let leaveData = response.data.leaveData;
                    let dom = '';
                    for (let item of leaveData) {
                        dom = dom + `
                        <div class="hole_comment_item">
                            <p>${item.userName}</p>
                            <span>${item.leaveMsg}</span>
                        </div>
                        `
                    }
                    document.getElementsByClassName('hole_comment_box')[0].innerHTML = dom;
                });
            },
            send(e) {
                let leaveMsg = e.currentTarget.previousElementSibling.value;
                e.currentTarget.previousElementSibling.value = '';
                let div = document.createElement('div');
                let p = document.createElement('p');
                let span = document.createElement('span');
                div.setAttribute('class', 'hole_comment_item');
                p.innerText = document.getElementById('avater').title;
                span.innerText = leaveMsg;
                div.appendChild(p);
                div.appendChild(span);
                document.getElementsByClassName('hole_comment_box')[0].appendChild(div);
                axios.post('/leaveMsg', {
                    diaryId: this.diaryId,
                    leaveMsg
                }).then(response => {
                    if (response.data.code === 0) {
                        alert('留言成功！')
                    }
                })
            }
        }
    })

}

function signOut() {
    axios.get('/signOut').then(response => {
        if (response.data.code === 0) {
            window.location.href = '/'
        }
    });
}

export {register, login, setUp, modify, diary, love, hole, signOut};


