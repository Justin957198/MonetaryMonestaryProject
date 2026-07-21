window.addEventListener("DOMContentLoaded", loadUser);
const infoButton = document.getElementById('info-button');
const infoListElement = document.getElementById('info-list');
const logoutButton = document.getElementById('logout');
const openAccountBtn = document.getElementById('open-account');
let infoLoaded = false;
let frontUser = null;

async function loadUser() {
    try {
        const token = localStorage.getItem('accessToken')
        const user = await fetch("http://localhost:8080/authenticate/you", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        if(!user.ok || user.status === 401) {
            //throw new Error("Not Authenticated");
            refresh();
            return;
        }

        frontUser = await user.json();
        console.log(frontUser)
        document.getElementById("user-welcome")
        .textContent = `Welcome ${frontUser.username}`;
        if(frontUser.usersAccounts !== undefined) {
            Object.entries(frontUser.usersAccounts).forEach(([accountNumber, account]) => {
                let statusClass = "";
                if(account.status === "Unlocked") {
                statusClass = "status-unlocked"
            } else {
                statusClass = "status-locked"
            }
                document.getElementById('accounts-list')
            .innerHTML += `
            <div class="account-block">
            <hr>
            <h3>${account.accountType}</h3>
            <p>Account Number: ${accountNumber} | Routing: ${account.routingNumber}</p>
            <p>Avaliable Balance: ${account.currency}</p>
            <div class="status-squares"><span class="module ${statusClass}"></span><span class="module"></span><span class="module"></span></div>
            <hr>
            </div>`
            });
        } else {
            document.getElementById('accounts-list')
            .textContent = `No accounts exist, please open an account above.`
        }
        
    } catch(ex) {
        console.log(ex);
    }
}

async function refresh() {
    const newToken = await fetch("http://localhost:8080/authenticate/refresh", {
        method: "POST",
        credentials: "include"
    });

    if(!newToken.ok) {
        localStorage.removeItem("accessToken");
        window.location.href = "http://localhost:5500/index.html";
    }

    const tokenData = await newToken.json();
    //console.log(tokenData);

    localStorage.setItem(
        "accessToken",
        tokenData.token
    );

    await loadUser();
}

async function openAccountForm() {
    document.getElementById('account-form')
    .innerHTML = `<label>Select account type</label><br>
    <label>Cheackings</label>
    <input type="radio" id="type_checkings" name="account_type" value="Checking">
    <label>Savings</label>
    <input type="radio" id="type_savings" name="account_type" value="Savings"><br>
    <label>Set Account Minimum (leave blank for none)</label><br>
    <input type="number" id="minimum" value=0><br>
    <label>Transfer Limit</label>
    <input type="number" id="trans_limit" name="trans_limit" value=0><br>
    <label>Enable Overdraft?</label><input type="checkbox" id="over_draft" name="over_draft"><br>
    <button onclick="submitAccount()">Open</button>`
}

async function submitAccount() {
    const accountType = document.querySelector('input[name="account_type"]:checked')?.value;
    const Minimum = Number(document.getElementById('minimum').value);
    const Transfer_Limit = Number(document.getElementById('trans_limit').value);
    const OverDreaftBox = document.getElementById('over_draft').checked;
    let Overdraft = null;

    if(OverDreaftBox) {
        Overdraft = "YES";
    } else {
        Overdraft = "NO";
    }
    const accInfo = {
        Minimum,
        Overdraft, 
        Transfer_Limit
    };

    const accountPayload = {
        accountType,
        username: frontUser.username,
        accInfo
    }

    try {
        const response = await fetch("http://localhost:8080/web/bank/account/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            },
            body: JSON.stringify(accountPayload)
        });

        if(response.status === 401) {
            await refresh()
            return submitAccount()
            
        }

        if(!response.ok) {
            console.log(response.status);
        }

        const result = await response.json();
        document.getElementById('ErrorOrComfirmation')
        .textContent = result.text();
    } catch(ex) {
        console.log(ex.message);
    }
}

function loadInfo() {
    window.location.href = "http://localhost:5500/inner_website/user.html"
}

function logout() {

}

openAccountBtn.addEventListener("click", openAccountForm);
infoButton.addEventListener("click", loadInfo);