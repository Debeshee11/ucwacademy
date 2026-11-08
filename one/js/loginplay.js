/* The audience word on the sign-in screen cycles: for Everyone, for Kids, for Students... */
const WORDS = ["for Everyone", "for Kids", "for Students", "for Professionals", "for Homemakers", "for Retirees"];

export function playHero(word) {
  let i = 0;
  const timer = setInterval(() => {
    if (!word.isConnected) return clearInterval(timer);
    i = (i + 1) % WORDS.length;
    word.textContent = WORDS[i]; word.dataset.c = String(i % 5);
    word.classList.remove("swap"); void word.offsetWidth; word.classList.add("swap");
  }, 2200);
}
