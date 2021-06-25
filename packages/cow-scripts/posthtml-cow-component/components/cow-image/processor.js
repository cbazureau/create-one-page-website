{
  /* <picture class="CowPicture">
    <source 
    srcset="{{{src}}} 375w, {{{src}}} 640w, {{{src}}} 750w, {{{src}}} 1024w, {{{src}}} 1280w, {{{src}}} 2048w, {{{src}}} 2560w" 
    type="image/webp" 
    sizes="100vw"
    />
    <source 
    srcset="{{{src}}} 375w, {{{src}}} 640w, {{{src}}} 750w, {{{src}}} 1024w, {{{src}}} 1280w, {{{src}}} 2048w, {{{src}}} 2560w"
    type="image/jpeg" 
    sizes="100vw"
    />
    <img src="{{{src}}}" alt="{{{alt}}}" class="CowPicture__img">
    <noscript>
    <img src="{{{src}}}" alt="{{{alt}}}" />
    </noscript>
</picture> */
}

module.exports = {
  processor: ({ attrs = {}, content = {} }, { htmlPath }) => {
    const { src, alt } = attrs;
    return {
      tag: 'div',
      attrs: {
        class: 'cow-image',
      },
      content: [src],
    };
  },
};
