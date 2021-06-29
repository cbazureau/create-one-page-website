// https://blog.bitsrc.io/lazy-loading-images-using-the-intersection-observer-api-5a913ee226d
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
  const arr = document.querySelectorAll('.CowImage');
  arr.forEach(v => {
    imageObserver.observe(v);
  });
});
