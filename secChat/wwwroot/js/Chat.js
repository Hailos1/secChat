"use strict";

let ChatList = document.getElementsByClassName("chat-img");
let FormChat = document.getElementsByClassName("work-table")[0];

for (let i = 0; i < ChatList.length; i++) {
    ChatList[i].addEventListener('click', (event) => clicker(event));
}

async function clicker(event) {
    FormChat.dataset.chatid = event.target.dataset.chatid;
    FormChat.style.display = "block";
    var user1 = await getAsyncUser()
    var chatid1 = FormChat.dataset.chatid;
    document.getElementById("messages-list").innerHTML = "";
    connection.invoke("GetMessages", user1, chatid1, 0, 100).catch(function (err) {
        return console.error(err.toString());
    });
}

var connection = new signalR.HubConnectionBuilder().withUrl("/messengerHub").build();

connection.on("ReceiveMessages", function (json) {
    console.log(json)
    let info = JSON.parse(json);
    let user = info[i]['UserId'];
    let userimg = info[i]['UserImg'];
    let username = info[i]['UserName'];
    let message = info[i]['Message'];
    let messageid = info[i]['MessageId'];
    var li = document.createElement("li");
    li.innerHTML = '<div class="user-data">' +
        '<img class="user-img" src="'+ userimg +'">' +
        '<h3 class="user-name">'+ username +'</h3>'  +
                        '</div>' +
    '<p class="message-content">'+ message +'</p>';
    li.dataset.userid = user;
    li.classList.add("message");
    document.getElementById("messages-list").prepend(li);   
    // We can assign user-supplied strings to an element's textContent because it
    // is not interpreted as markup. If you're assigning in any other way, you 
    // should be aware of possible script injection concerns.
    //li.textContent = `${user}: ${message}`;
    //isMyMessage(user);
});

async function isMyMessage() {
    let messages = document.getElementsByClassName("message");
    let thisUser = await getAsyncUser();
    for (let i = 0; i < messages.length; i++) {
        if (thisUser === messages[i].dataset.userid && !messages[i].classList.contains("your-message")) {
            messages[i].classList.add("your-message");
        }       
    }
}

document.getElementById("send-button").disabled = true;

connection.on("ReceiveMessage", function (json) {
    console.log(json);
    let info = JSON.parse(json);
    let user = info[i]['UserId'];
    let userimg = info[i]['UserImg'];
    let username = info[i]['UserName'];
    let message = info[i]['Message'];
    let messageid = info[i]['MessageId'];
    var li = document.createElement("li");
    li.innerHTML = '<div class="user-data">' +
        '<img class="user-img" src="' + userimg + '">' +
        '<h3 class="user-name">' + username + '</h3>' +
        '</div>' +
        '<p class="message-content">' + message + '</p>';
    li.dataset.userid = user;
    li.classList.add("message");
    document.getElementById("messages-list").prepend(li); 
    // We can assign user-supplied strings to an element's textContent because it
    // is not interpreted as markup. If you're assigning in any other way, you 
    // should be aware of possible script injection concerns.
    //li.textContent = `${user}: ${message}`;
});

async function getAsyncUser() {
    const response = await fetch("/whoUser", {
        method: "GET",
        headers: {
            "Accept": "application/json",
        }
    });
    if (response.ok === true) {
        const data = await response.json();
        return data.UserId;
    }
}

connection.start().then(function () {
    document.getElementById("send-button").disabled = false;   
}).catch(function (err) {
    return console.error(err.toString());
});


document.getElementById("send-button").addEventListener("click", async function (event) {

    var user = await getAsyncUser()
    var message = document.getElementById("user-message").value;
    document.getElementById("user-message").value = "";
    var chatid = FormChat.dataset.chatid;
    connection.invoke("SendMessage", user, message, chatid).catch(function (err) {
        return console.error(err.toString());
    });
    event.preventDefault();
});