/* eslint-disable */
document.addEventListener('DOMContentLoaded', function () {
  const imageObserver = new IntersectionObserver((entries, imgObserver) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const lazyImage = entry.target;
        lazyImage.childNodes.forEach(c => {
          if (c.dataset) {
            if (c.dataset.src) c.src = c.dataset.src;
            if (c.dataset.srcset) c.srcset = c.dataset.srcset;
          }
        });
      }
    });
  });
  const arr = document.querySelectorAll('[data-ref="cow-image"]');
  arr.forEach(v => {
    imageObserver.observe(v);
  });
});
