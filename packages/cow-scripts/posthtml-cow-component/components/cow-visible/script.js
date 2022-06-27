/* eslint-disable */
document.addEventListener('DOMContentLoaded', function () {
  const imageObserver = new IntersectionObserver((entries, imgObserver) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const lazyDiv = entry.target;
        if (!lazyDiv.classList.contains('is-visible'))
          lazyDiv.classList.add('is-visible');
      }
    });
  });
  const arr = document.querySelectorAll('[data-ref="cow-visible"]');
  arr.forEach(v => {
    imageObserver.observe(v);
  });
});
