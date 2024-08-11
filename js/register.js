import { GROUP_KEY } from "./global.js";

if (localStorage.getItem("username") != null) {
  location.href = "main.html";
}

const inputElements = document.getElementsByClassName("input-field");

for (const inputElement of inputElements) {
  inputElement.addEventListener("input", (e) => {
    checkValidity(e.target);
  });
}

for (const errorField of document.getElementsByClassName("error-field")) {
  errorField.addEventListener("mouseenter", (e) => {
    errorField.children[0].classList.remove("invisible");
  });
  errorField.addEventListener("mouseleave", (e) => {
    errorField.children[0].classList.add("invisible");
  });
}

function checkValidity(target) {
  if (isValid(target.value, target.id)) {
    target.classList.remove("invalid");
    document
      .getElementById(target.id + "-error-field")
      .classList.add("invisible");
    return true;
  } else {
    target.classList.add("invalid");
    document
      .getElementById(target.id + "-error-field")
      .classList.remove("invisible");
    return false;
  }
}

function isValid(input, id) {
  let isValid;
  switch (id) {
    case "user-name":
      isValid = /^[a-zA-Z0-9]{4,10}$/.test(input);
      break;
    case "display-name":
      isValid = input.length >= 4 && input.length <= 30;
      break;
    case "password":
      isValid =
        /^[a-zA-Z0-9]{6,12}$/.test(input) &&
        /[a-zA-Z]/.test(input) &&
        /[0-9]/.test(input);
      break;
    case "description":
      isValid = input.length <= 300;
      break;
    default:
      isValid = true;
  }
  return isValid;
}

document.getElementById("register").addEventListener("click", register);

document.addEventListener("keydown", (event) => {
  const key = event.key;
  if (key === "Enter") {
    register();
  }
});

async function register() {
  const username = document.getElementById("user-name").value;
  const password = document.getElementById("password").value;
  const displayName = document.getElementById("display-name").value;
  const description = document.getElementById("description").value;

  let valid = true;
  for (const inputElement of inputElements) {
    if (!checkValidity(inputElement) && valid) {
      valid = false;
    }
  }
  if (!valid) {
    return;
  }

  document.body.style.cursor = "wait";
  const wasSuccessful = await registerUser(
    username,
    password,
    displayName,
    description
  );
  document.body.style.cursor = "unset";
  if (!wasSuccessful) {
    return;
  }

  console.log(
    `registered user: username: ${username}, password: ${password}, display name: ${displayName}, description: ${description}`
  );

  localStorage.setItem("username", username.toLowerCase());
  localStorage.setItem("password", password);

  window.location.href = "main.html";
}

async function registerUser(name, password, displayName, description) {
  const response = await fetch("https://lukas.rip/api/users", {
    method: "POST",
    headers: {
      "group-key": GROUP_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: name,
      password: password,
      profile: {
        displayName: displayName,
        description: description,
      },
    }),
  });
  console.log(response.status);
  if (response.status === 201) {
    return true;
  } else if (response.status === 400) {
    alert("invalid entries");
    return false;
  } else if (response.status === 409) {
    alert("A profile with this username already exists");
    return false;
  }
}
