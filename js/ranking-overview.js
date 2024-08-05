import { GROUP_KEY } from './global.js';
import { RANKING_ID } from './main.js';


document.addEventListener("DOMContentLoaded", () => {
    let titleDiv = document.getElementById("title");
    titleDiv.textContent = RANKING_ID;
    console.log(RANKING_ID);
})