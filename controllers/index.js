const loginBtn = document.getElementsByName('loginBtn');
// username.value = 'tnoor';

ws.onopen = (user) => {
    // const username = document.getElementById('username');
    // const password = document.getElementById('password');
    //
    // clickLogin(username, password);
    // console.log(user);
    // ws.onmessage = ev => {
    //     const data = JSON.parse(ev.data);
    //     for (let i = 0; i < data.length; i++) {
    //         console.log(`received message: ${data[i]['password']}`);
    //     }
    // };
};

// function clickLogin (userName, passWord) {
//     loginBtn[0].addEventListener('click', () => {
//         console.log(userName.value);
//         ws.send(JSON.stringify({
//             type: 'authenticate',
//             username: userName.value,
//             password: passWord.value
//         }));
//         console.log(passWord.value);
//     });
// }

