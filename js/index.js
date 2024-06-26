document.addEventListener('DOMContentLoaded', async () => {
    await fetch('https://lukas.rip/api/users', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "group-key": GROUP_KEY,
        },
        body: JSON.stringify({
            username: "Ncio",
            password: "Ncio123",
            profile: {
                displayName: "Ncioo",
                description: "Ncio ist schön",
            }
        })
    })
    const users = await fetch('https://lukas.rip/api/users', {
        method: 'GET',
        headers: {
            "group-key": GROUP_KEY
        }
    })
    console.log(await users.json());

})



const GROUP_KEY = '2ujgh9kh'