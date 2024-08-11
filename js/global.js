export const GROUP_KEY = "2ujgh9kh";

const username = localStorage.getItem("username");
const password = localStorage.getItem("password");
document.getElementById("nav-bar").innerHTML = `
    <img id='icon' src="../assets/icon.png"></img>
    <input id='search-bar' list='users' placeholder='🔎 Search for users...'>
    <datalist id='users'></datalist>
    ${
      username
        ? `<div id='right-container'>
        <button id='new-ranking-button' class="primary-button">
            <img src='../assets/plus-icon.png' alt='Icon'>
            New Ranking
        </button>
        <div id='profile-actions'>
            <div id='avatar'>${username.at(0).toUpperCase()}</div>
                <div id='drop-down' class='invisible'>
                    <div id='profile' class='drop-down-item'>Profile</div>
                    <div id='log-out' class='drop-down-item'>Log Out</div>       
                    <div id='delete-account' class='drop-down-item'>Delete my account</div>              
                </div>
        </div>`
        : `
         <button id='login-button' class="primary-button">Login</button>
        `
    }
    </div>
`;

document.getElementById("icon").onclick = () => {
  location = "main.html";
};

document
  .getElementById("search-bar")
  .addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      const selectedUser = document.getElementById("search-bar").value;
      const userOption = Array.from(
        document.querySelectorAll("#users option")
      ).find((option) => option.value === selectedUser);

      if (userOption) {
        const user = JSON.parse(userOption.dataset.user);
        localStorage.setItem("user", JSON.stringify(user));
        location.href = "profile.html";
      } else {
        console.log("User not found.");
      }
    }
  });

document.getElementById("new-ranking-button")?.addEventListener("click", () => {
  const newRanking = {
    title: "My Ranking",
    description: "",
    tiers: [
      {
        title: "tire-1",
        content: ["example-item", "example-item"],
        color: "#444444",
      },
      {
        title: "tire-2",
        content: ["example-item", "example-item"],
        color: "#444444",
      },
    ],
    username: localStorage.getItem("username"),
  };

  localStorage.setItem("ranking", JSON.stringify(newRanking));
  location = "ranking.html";
});

document.getElementById("login-button")?.addEventListener("click", () => {
  location = "login.html";
});

document.getElementById("avatar")?.addEventListener("click", () => {
  document.getElementById("drop-down").classList.toggle("invisible");
});
document.getElementById("main").addEventListener("click", () => {
  document.getElementById("drop-down")?.classList.add("invisible");
});

document.getElementById("profile")?.addEventListener("click", async () => {
  const userName = localStorage.getItem("username");
  const user = await getUser(userName);
  localStorage.setItem("user", JSON.stringify(user));
  location.href = "profile.html";
});

document.getElementById("log-out")?.addEventListener("click", () => {
  localStorage.removeItem("username");
  localStorage.removeItem("password");
  location.href = "login.html";
});

document
  .getElementById("delete-account")
  ?.addEventListener("click", async () => {
    await deleteAllUserRankings(username, password);
    await deleteUser(username, password);
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    location.href = "login.html";
  });

getUsers();

async function getUsers() {
  const usersResponse = await fetch("https://lukas.rip/api/users", {
    method: "GET",
    headers: {
      "group-key": GROUP_KEY,
    },
  });
  const users = await usersResponse.json();
  const userDataList = document.getElementById("users");
  userDataList.innerHTML = "";
  for (const user of users) {
    const option = document.createElement("option");
    option.text = user.profile.displayName;
    option.value = user.username;
    option.dataset.user = JSON.stringify(user);
    userDataList.appendChild(option);
  }
}

async function getUser(userName) {
  const userResponse = await fetch("https://lukas.rip/api/users/" + userName, {
    method: "GET",
    headers: {
      "group-key": GROUP_KEY,
    },
  });
  const user = await userResponse.json();
  console.log(user);
  return user;
}

async function deleteUser(userName, password) {
  await fetch("https://lukas.rip/api/users/" + userName, {
    method: "DELETE",
    headers: {
      "group-key": GROUP_KEY,
      authorization: `Basic ${btoa(userName + ":" + password)}`,
    },
  });
  console.log("deleted user: " + userName);
}

async function deleteAllUserRankings(userName, password) {
  const response = await fetch(
    "https://lukas.rip/api/users/" + userName + "/rankings",
    {
      method: "GET",
      headers: {
        "group-key": GROUP_KEY,
      },
    }
  );

  const allUserRankings = await response.json();
  const deletePromises = allUserRankings.map((ranking) => {
    return deleteRanking(userName, password, ranking.id);
  });
  await Promise.all(deletePromises);
}

async function deleteRanking(userName, password, id) {
  const response = await fetch("https://lukas.rip/api/rankings/" + id, {
    method: "DELETE",
    headers: {
      "group-key": GROUP_KEY,
      authorization: `Basic ${btoa(userName + ":" + password)}`,
    },
  });

  if (response.status === 204) {
    console.log("deleted ranking with id" + id);
  } else {
    alert("Can’t delete this ranking, error:" + response.status);
  }
}
