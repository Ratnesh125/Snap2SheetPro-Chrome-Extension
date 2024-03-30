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

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('runTesseract').addEventListener('click', async function () {
    try {
      // Capture visible tab
      const dataUrl = await new Promise((resolve) => {
        chrome.tabs.captureVisibleTab({ format: "png" }, resolve);
      });

      // Pass the screenshot data to readImage
      const grayScaleImageBuffer = await readImage(dataUrl);

      const formData = new FormData();
      formData.append("image", new Blob([grayScaleImageBuffer], { type: 'image/jpeg' }), 'grayscale_image.jpg');

      // Send POST request with form data
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
      });

      //Error Checking
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseData = await response.json();
      console.log('Response:', responseData);
    } catch (error) {
      console.error('Error:', error);
    }
  });
});
