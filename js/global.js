document.addEventListener('DOMContentLoaded', () => {
    const goToLoginPage = document.getElementsByClassName('to-login');
    for (navElement of goToLoginPage) {
        navElement.addEventListener('click', (e) => {
            window.location.href = ("../login.html");
        })
    }

    const goToRegisterPage = document.getElementsByClassName('to-register');
    console.log(goToRegisterPage);
    for (navElement of goToRegisterPage) {
        navElement.addEventListener('click', (e) => {
            console.log(e.target.className);
            window.location.href = ("../register.html");
        })
    }
})