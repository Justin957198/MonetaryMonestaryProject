window.addEventListener("DOMContentLoaded", loadUser);
const infoButton = document.getElementById('info-button');
const infoListElement = document.getElementById('info-list');
const logoutButton = document.getElementById('logout');
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
        if(!user.ok || user.statusText === "Unauthorized") {
            //throw new Error("Not Authenticated");
            refresh();
            return;
        }

        frontUser = await user.json();
        console.log(frontUser)
        document.getElementById("user-welcome")
        .textContent = `Welcome ${frontUser.username} AKA ${frontUser.userDetails[0]}`;
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
    console.log(tokenData);

    localStorage.setItem(
        "accessToken",
        tokenData.token
    );

    await loadUser();
}

function loadInfo() {
    if(!infoLoaded) {
    infoListElement.innerHTML += `<li>Name: ${frontUser.userDetails[0]}</li>
                        <li>Phone: ${frontUser.userDetails[1]}</li>
                        <li>Gender: ${frontUser.userDetails[2]}</li>
                        <li>Address: ${frontUser.userDetails[3]}</li>
                        <li>Birthday: ${frontUser.userDetails[5]}</li> `;
                        infoLoaded = true;
    } else {
        infoListElement.replaceChildren();
        infoLoaded = false;
    }

}

function logout() {
    
}

infoButton.addEventListener("click", loadInfo)