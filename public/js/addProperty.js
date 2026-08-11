const addPropertyForm = document.getElementById('addPropertyForm');

if (addPropertyForm) {
  addPropertyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      alert('Please log in first as a Landlord or Agent.');
      window.location.href = '/login.html';
      return;
    }

    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('propertyType', document.getElementById('propertyType').value);
    formData.append('area', document.getElementById('area').value);
    formData.append('address', document.getElementById('address').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('pricePeriod', document.getElementById('pricePeriod').value);

    // Selected Features
    const selectedFeatures = Array.from(
      document.querySelectorAll('input[name="features"]:checked')
    ).map((cb) => cb.value);
    formData.append('features', JSON.stringify(selectedFeatures));

    // Uploaded Images
    const imageInput = document.getElementById('images');
    for (let i = 0; i < imageInput.files.length; i++) {
      formData.append('images', imageInput.files[i]);
    }

    const alertBox = document.getElementById('alertBox');

    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        if (alertBox) alertBox.innerText = 'Property listed successfully!';
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 1200);
      } else {
        if (alertBox) alertBox.innerText = data.message || 'Failed to add property';
      }
    } catch (error) {
      if (alertBox) alertBox.innerText = 'Server error. Please try again.';
    }
  });
}