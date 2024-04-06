async function readImage(dataUrl) {
  try {
    const image = await Jimp.read(dataUrl);
    const grayScaleImage = await image.color([{ apply: 'brighten', params: [0] }])
      .contrast(0)
      .greyscale()
      .getBufferAsync(Jimp.MIME_JPEG);

    console.log('Grayscale image processed successfully', grayScaleImage);
    return grayScaleImage;
  } catch (err) {
    console.error('Error processing image:', err);
    throw err;
  }
}

  document.getElementById('runTesseract').addEventListener('click', async function () {
    if (this.innerText === 'Save to Sheets') {

      try {
        const runTesseractButton = document.getElementById('runTesseract');
        runTesseractButton.innerText = 'Processing, please wait...';

        const sheetIdData = await new Promise((resolve) => {
          chrome.storage.sync.get('sheetId', resolve);
        });
        const sheetId = sheetIdData.sheetId;

        const dataUrl = await new Promise((resolve) => {
          chrome.tabs.captureVisibleTab({ format: "png" }, resolve);
        });

        const grayScaleImageBuffer = await readImage(dataUrl);

        const formData = new FormData();
        formData.append("image", new Blob([grayScaleImageBuffer], { type: 'image/jpeg' }), 'grayscale_image.jpg');
        formData.append("sheetId", sheetId);

        const response = await fetch('http://localhost:8080/upload', {
          method: 'POST',
          body: formData
        });
        const responseData = await response.json();
 
        runTesseractButton.innerText = responseData.message
        setTimeout(() => {
          runTesseractButton.innerText = 'Save to Sheets'
        }, 5000);

      } catch (error) {
        console.error('Error:', error);
         document.getElementById('runTesseract').innerText = 'Save to Sheets';
      }
    }
  });

});
