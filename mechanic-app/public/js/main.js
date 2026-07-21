// Load services into both the "Our Services" section and the request form dropdown
async function loadServices() {
  const res = await fetch('/api/services');
  const services = await res.json();

  const grid = document.getElementById('servicesGrid');
  const select = document.getElementById('serviceId');

  grid.innerHTML = '';
  services.forEach(service => {
    // Service card
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${service.name}</h3>
      <p>${service.description}</p>
      <div class="price">${service.price}</div>
    `;
    grid.appendChild(card);

    // Dropdown option
    const option = document.createElement('option');
    option.value = service.id;
    option.textContent = service.name;
    select.appendChild(option);
  });
}

// Handle the request form submission
document.getElementById('requestForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    customerName: document.getElementById('customerName').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    vehicle: document.getElementById('vehicle').value,
    serviceId: Number(document.getElementById('serviceId').value),
    notes: document.getElementById('notes').value
  };

  const msgBox = document.getElementById('formMessage');

  try {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (res.ok) {
      msgBox.innerHTML = `<div class="msg success">Request submitted! We'll contact you shortly to confirm.</div>`;
      document.getElementById('requestForm').reset();
    } else {
      msgBox.innerHTML = `<div class="msg error">${data.error}</div>`;
    }
  } catch (err) {
    msgBox.innerHTML = `<div class="msg error">Something went wrong. Please try again.</div>`;
  }
});

loadServices();
