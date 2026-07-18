```javascript
const track = document.querySelector("[data-project-track]");
const previousButton = document.querySelector("[data-slider-previous]");
const nextButton = document.querySelector("[data-slider-next]");

function moveProjects(direction) {
  if (!track) return;

  const firstCard = track.querySelector(".project-card");
  const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 360;
  track.scrollBy({
    left: direction * (cardWidth + 18),
    behavior: "smooth"
  });
}

previousButton?.addEventListener("click", () => moveProjects(-1));
nextButton?.addEventListener("click", () => moveProjects(1));
```
