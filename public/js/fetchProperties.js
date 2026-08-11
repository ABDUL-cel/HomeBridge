async function loadProperties() {
  const propertyGrid = document.getElementById('propertyGrid');
  if (!propertyGrid) return;

  try {
    const res = await fetch('/api/properties?status=available');
    const data = await res.json();

    if (!data.success || data.data.length === 0) {
      propertyGrid.innerHTML = `<p style="text-align:center; grid-column: 1/-1;">No available properties found at the moment.</p>`;
      return;
    }

    propertyGrid.innerHTML = data.data
      .map((item) => {
        const coverImage = item.images && item.images.length > 0 ? item.images[0] : '/images/default-house.jpg';
        const ownerPhone = item.owner ? item.owner.phone : '';

        return `
        <div class="property-card" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #fff;">
          <div style="position: relative; height: 200px;">
            <img src="${coverImage}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;">
            <span style="position: absolute; top: 10px; right: 10px; background: #0284c7; color: #fff; padding: 4px 8px; font-size: 12px; border-radius: 4px; text-transform: uppercase;">${item.propertyType}</span>
          </div>
          <div style="padding: 16px;">
            <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #0f172a;">${item.title}</h3>
            <p style="color: #64748b; font-size: 14px; margin: 0 0 12px 0;">📍 ${item.location.area}, ${item.location.city}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="font-size: 18px; font-weight: bold; color: #0284c7;">₦${item.price.toLocaleString()} <small style="font-size: 12px; font-weight: normal; color: #64748b;">/${item.pricePeriod}</small></span>
            </div>
            <div style="display: flex; gap: 8px;">
              <a href="/property-detail.html?id=${item._id}" style="flex: 1; text-align: center; background: #e0f2fe; color: #0284c7; padding: 8px; border-radius: 6px; text-decoration: none; font-weight: 500;">View Details</a>
              <a href="https://wa.me/234${ownerPhone.replace(/^0/, '')}?text=Hello,%20I%20am%20interested%20in%20your%20property:%20${encodeURIComponent(item.title)}" target="_blank" style="background: #22c55e; color: #fff; padding: 8px 12px; border-radius: 6px; text-decoration: none; font-weight: 500;">WhatsApp</a>
            </div>
          </div>
        </div>
      `;
      })
      .join('');
  } catch (error) {
    console.error('Failed to load properties:', error);
  }
}

document.addEventListener('DOMContentLoaded', loadProperties);