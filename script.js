const menuBtn = document.getElementById("menuBtn");
const navLinks = document.querySelector(".nav-links");
const navButtons = document.querySelector(".nav-buttons");

menuBtn.addEventListener("click", function () {
    navLinks.classList.toggle("mobile-show");
    navButtons.classList.toggle("mobile-show");
});
