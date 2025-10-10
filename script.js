 const uploadImage = document.getElementById('uploadImage');
    const removeBtn = document.getElementById('removeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const imagePreview = document.getElementById('imagePreview');
    const bgRemoved = document.getElementById('bgRemoved');
    const loader = document.getElementById('loader');
    const errorMsg = document.getElementById('errorMsg');
    const dropZone = document.getElementById('dropZone');

    let selectedFile;
    let resultImageURL;

    // Drag & Drop handlers
    dropZone.addEventListener('click', () => uploadImage.click());

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    });

    uploadImage.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    });

    function handleFile(file) {
      const maxSizeMB = 5;
      if (file.size > maxSizeMB * 1024 * 1024) {
        showError(`File size exceeds ${maxSizeMB}MB limit.`);
        return;
      }

      if (!file.type.startsWith('image/')) {
        showError('Only image files are allowed.');
        return;
      }

      clearError();
      selectedFile = file;
      const reader = new FileReader();
      reader.onload = (event) => {
        imagePreview.src = event.target.result;
        bgRemoved.src = '';
        removeBtn.disabled = false;
        downloadBtn.style.display = 'none';
      };
      reader.readAsDataURL(file);
    }

    removeBtn.addEventListener('click', async () => {
      if (!selectedFile) {
        showError('Please upload an image first.');
        return;
      }

      clearError();
      loader.style.display = 'block';
      removeBtn.disabled = true;
      clearBtn.disabled = true;

      const formData = new FormData();
      formData.append('image_file', selectedFile);

      try {
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: {
            'X-Api-Key': '1mhx1s8w6QS7dVm4Rv6sRcDU' // Replace with your API key
          },
          body: formData
        });

        loader.style.display = 'none';
        removeBtn.disabled = false;
        clearBtn.disabled = false;

        if (!response.ok) {
          throw new Error('Background removal failed. Please try again.');
        }

        const blob = await response.blob();
        if (resultImageURL) URL.revokeObjectURL(resultImageURL);
        resultImageURL = URL.createObjectURL(blob);
        bgRemoved.src = resultImageURL;
        downloadBtn.style.display = 'inline-block';
      } catch (error) {
        loader.style.display = 'none';
        removeBtn.disabled = false;
        clearBtn.disabled = false;
        showError(error.message);
      }
    });

    clearBtn.addEventListener('click', () => {
      selectedFile = null;
      if (resultImageURL) URL.revokeObjectURL(resultImageURL);
      resultImageURL = null;
      imagePreview.src = '';
      bgRemoved.src = '';
      removeBtn.disabled = true;
      downloadBtn.style.display = 'none';
      clearError();
    });

    downloadBtn.addEventListener('click', () => {
      if (!resultImageURL) return;
      const a = document.createElement('a');
      a.href = resultImageURL;
      a.download = 'background_removed.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });

    function showError(message) {
      errorMsg.textContent = message;
    }

    function clearError() {
      errorMsg.textContent = '';
    }
