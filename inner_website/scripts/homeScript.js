window.addEventListener("DOMContentLoaded", loadUser);
const infoButton = document.getElementById('info-button');
const infoListElement = document.getElementById('info-list');
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
        if(!user.ok) {
            throw new Error("Not Authenticated");
        }

        frontUser = await user.json();
        console.log(frontUser)
        document.getElementById("user-welcome")
        .textContent = `Welcome ${frontUser.username} AKA ${frontUser.userDetails[0]}`;
    } catch(ex) {
        console.log(ex);
    }
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

infoButton.addEventListener("click", loadInfo)