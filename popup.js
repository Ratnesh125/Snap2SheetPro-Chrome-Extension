document.addEventListener('DOMContentLoaded', function () {
  // Add an event listener to the button
  document.getElementById('runTesseract').addEventListener('click', function () {
    // Run Tesseract.js script on button click
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var activeTab = tabs[0];
      chrome.tabs.captureVisibleTab({ format: "png" }, function (dataUrl) {
        // Use Jimp to process the screenshot and run Tesseract.js OCR
        Jimp.read(dataUrl)
          .then(function (image) {
            image
              .color([
                { apply: 'brighten', params: [0] }
              ])
              .contrast(0)
              .greyscale()
              .getBase64(Jimp.MIME_JPEG, function (err, processedDataUrl) {
                if (err) throw err;

                // Run Tesseract.js OCR on the processed image
                Tesseract.recognize(
                  processedDataUrl,
                  'eng',
                  {
                    psm: 7,
                    oem: 3,
                  }
                ).then(({ data: { text } }) => {
                  console.log(text, processedDataUrl);
                });
              });
          })
          .catch(function (err) {
            console.error(err);
          });
      });
    });
  });
});
