[![Build Status](https://travis-ci.org/sblask/webextension-enhanced-image-viewer.svg?branch=master)](https://travis-ci.org/sblask/webextension-enhanced-image-viewer)

Enhanced Image Viewer
=====================

Enhances the browser's default image viewer with:

 - more scaling modes (configurable in the preferences - click toolbar button)
   to cycle through when left-clicking
 - easy rotation (in 90° steps) using `l` and `r` for left and right rotation
   respectively
 - scaling mode and rotation can be remembered so they are applied when opening
   other images
 - configurable background color
 - image information and information about scaling mode and rotation are
   briefly shown when opening an image and can be toggled by pressing `i`

Default browser zoom (ctrl-scroll/ctrl-plus/ctrl-minus) can still be used, but
probably only works as expected in natural size scaling mode. If the chosen
scaling mode is fitting the image to width or height, zooming does not change
the image size.

Feedback
--------

You can report bugs or make feature requests on
[Github](https://github.com/sblask/webextension-enhanced-image-viewer)

Patches are welcome.
