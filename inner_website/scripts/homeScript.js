window.addEventListener("DOMContentLoaded", loadUser);

async function loadUser() {
    try {
        const user = await fetch("http://localhost:8080/authenticate/you");
        if(!user.ok) {
            throw new Error("Not Authenticated");
        }

        const frontUser = await user.json();

        document.getElementById("user-welcome")
        .textContent = `Welcome ${frontUser.username}`;
    } catch(ex) {
        console.log("FETCH ERROR");
    }
}