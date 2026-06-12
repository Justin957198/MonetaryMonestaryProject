async function authenticate() {
    const endpoint = 'http://localhost:8080/authenticate/login/user';
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginRequest = {
        username: username,
        password: password
    };

    const payload = new URLSearchParams(loginRequest).toString();

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                    "Content-type": "application/x-www-form-urlencoded"
                },
                body: payload
            });
        if(!response.ok) {
            console.log("ERROR")
        }

        const data = await response.json();
        localStorage.setItem("accessToken", data.tokenA);
        localStorage.setItem("refresh", data.tokenB);
        console.log(data);
    } catch(ex) {
        console.log("FETCH FAILED")
    }
}