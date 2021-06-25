(function () {
  Array.prototype.forEach.call(
    document.querySelectorAll('.cow-image'),
    function (img) {
      console.log(img);
    }
  );
})();
