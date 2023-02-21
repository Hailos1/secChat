var connection = new signalR.HubConnectionBuilder().withUrl("/messengerHub").build();

class Message extends React.Component {
    render() {
        if (this.props.path == null) {
            return (<li className="message" data-userid={this.props.user}>
                <div className="user-data">
                    <img className="user-img" src={this.props.userimg} />
                    <h3 className="user-name">{this.props.username}</h3>
                </div>
                <p className="message-content">{this.props.message}</p>
            </li>);
        }
        else {
            return (<li className="message" data-userid={this.props.user}>
                <div className="user-data">
                    <img className="user-img" src={this.props.userimg} />
                    <h3 className="user-name">{this.props.username}</h3>
                </div>
                <div className="message-content">
                    <p className="message-addition">{this.props.message}</p>
                    <img className="message-img" src={this.props.path} width="100%" />
                </div>
            </li>);
        }
    }
}

document.getElementById("send-button").disabled = true;

let scrollEl = document.getElementsByClassName("messages-list")[0];

let reactUl = ReactDOM.createRoot(scrollEl);

let ChatList = document.getElementsByClassName("chat-img");
let FormChat = document.getElementsByClassName("work-table")[0];

let start = 0;
let end = 100;
let fileid = 0;

let items = [];

for (let i = 0; i < ChatList.length; i++) {
    ChatList[i].addEventListener('click', (event) => clicker(event));
}

async function clicker(event) {
    FormChat.dataset.chatid = event.target.dataset.chatid;
    FormChat.style.display = "block";
    var user1 = await getAsyncUser()
    var chatid1 = FormChat.dataset.chatid;
    items = []
    start = 0;
    end = 100;
    fileid = 0;
    addCliper();
    connection.invoke("GetMessages", user1, chatid1, start, end).catch(function (err) {
        return console.error(err.toString());
    });
}

connection.on("ReceiveMessages", async function (json) {   
    let info = JSON.parse(json);
    for (let i = 0; i < info.length; i++) {    
        let user = info[i]['UserId'];
        let userimg = info[i]['UserImg'];
        let username = info[i]['UserName'];
        let message = info[i]['Message'];
        let messageid = info[i]['MessageId'];
        let path = info[i]['pathsAddition'];
        let li = <Message path={path} user={user} key={messageid} userimg={userimg} username={username} message={message} />
        items.push(li);
    }
    reactUl.render(items);
});

connection.on("ReceiveMessage", async function (json) {
    let info = JSON.parse(json);
    let user = info['UserId'];
    let userimg = info['UserImg'];
    let username = info['UserName'];
    let message = info['Message'];
    let messageid = info['MessageId'];
    let chatid = info['ChatId'];
    let path = info['pathsAddition'];
    if (chatid != FormChat.dataset.chatid) {
        return
    }       
    let li = <Message path={path} user={user} key={messageid} userimg={userimg} username={username} message={message} />
    items.unshift(li);
    reactUl = ReactDOM.createRoot(document.getElementById("messages-list"));
    reactUl.render(items);
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
    connection.invoke("SendMessage", user, message, chatid, fileid).catch(function (err) {
        return console.error(err.toString());
    });
    fileid = 0;
    event.preventDefault();
});

function addCliper() {
    document.getElementById("clip").addEventListener("click", async function () {
        let input = document.createElement("input");
        input.type = "file";
        input.name = "uploadedFile"
        input.onchange = async function (e) {
            console.log("onchange")
            let form = document.createElement("form");
            form.appendChild(input);
            let data = new FormData(form);
            fileid = await SendFile(data);
        }
        input.click();
    });
}

async function SendFile(data) {
    const response = await fetch("/AddFile", {
        method: "POST",
        body: data
    });
    if (response.ok === true) {
        const data = await response.json();
        return data;
    }
}
