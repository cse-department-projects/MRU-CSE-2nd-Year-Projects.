/* =========================
   FITZONE SCRIPT
========================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       SMOOTH SCROLLING
    ========================= */

    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {

        link.addEventListener("click", function (e) {

            const targetId = this.getAttribute("href");

            if (targetId === "#") return;

            const target = document.querySelector(targetId);

            if (target) {
                e.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

        });

    });


    /* =========================
       ORBIT ANIMATION
    ========================= */

    const orbit = document.querySelector(".orbit");
    const orbitItems = document.querySelectorAll(".orbit-item");

    let rotation = 0;

    function animateOrbit() {

        rotation += 0.08;

        if (orbit) {
            orbit.style.transform = `rotate(${rotation}deg)`;
        }

        requestAnimationFrame(animateOrbit);
    }

    if (orbit) {
        animateOrbit();
    }


    /* =========================
       SCROLL REVEAL
    ========================= */

    const revealElements = document.querySelectorAll(
        ".feature-card, .screen-preview, .screen-intro, .about-content, .cta"
    );

    const observer = new IntersectionObserver(
        (entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("show");

                    observer.unobserve(entry.target);

                }

            });

        },
        {
            threshold: 0.15
        }
    );

    revealElements.forEach(element => {
        element.classList.add("reveal");
        observer.observe(element);
    });


    /* =========================
       NAVBAR SCROLL EFFECT
    ========================= */

    const navbar = document.querySelector(".navbar");

    window.addEventListener("scroll", () => {

        if (window.scrollY > 40) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

    });


    /* =========================
       BUTTON FEEDBACK
    ========================= */

    const primaryButtons = document.querySelectorAll(".primary-btn");

    primaryButtons.forEach(button => {

        button.addEventListener("mouseenter", () => {

            const arrow = button.querySelector("i");

            if (arrow) {
                arrow.style.transform = "translateX(5px)";
            }

        });

        button.addEventListener("mouseleave", () => {

            const arrow = button.querySelector("i");

            if (arrow) {
                arrow.style.transform = "translateX(0)";
            }

        });

    });


    /* =========================
       ACTIVE NAVIGATION
    ========================= */

    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".navbar nav a");

    window.addEventListener("scroll", () => {

        let currentSection = "";

        sections.forEach(section => {

            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;

            if (
                window.scrollY >= sectionTop &&
                window.scrollY < sectionTop + sectionHeight
            ) {
                currentSection = section.getAttribute("id");
            }

        });

        navLinks.forEach(link => {

            link.classList.remove("active");

            const href = link.getAttribute("href");

            if (href === `#${currentSection}`) {
                link.classList.add("active");
            }

        });

    });

});