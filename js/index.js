document.addEventListener('DOMContentLoaded', async () => {
    const users = await fetch('https://lukas.rip/api/users', {
        method: 'GET',
        headers: {
            "group-key": "2ujgh9kh"
        }
    })
    console.log(await users.json());

})