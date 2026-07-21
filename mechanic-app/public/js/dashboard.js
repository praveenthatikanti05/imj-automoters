const token = localStorage.getItem('mechanicToken');

// Kick back to login if there's no token
if (!token) {
  window.location.href = 'login.html';
}

const requestsBody = document.getElementById('requestsBody');
const newBadge = document.getElementById('newBadge');

async function loadRequests() {
  const res = await fetch('/api/requests', {
    headers: { 'Authorization': token }
  });

  if (res.status === 401) {
    localStorage.removeItem('mechanicToken');
    window.location.href = 'login.html';
    return;
  }

  const requests = await res.json();
  renderRequests(requests);
  updateBadge(requests);
}

function renderRequests(requests) {
  if (requests.length === 0) {
    requestsBody.innerHTML = '<tr><td colspan="6">No requests yet.</td></tr>';
    return;
  }

  requestsBody.innerHTML = requests.map(r => `
    <tr class="${r.seen ? '' : 'new-row'}">
      <td>${new Date(r.createdAt).toLocaleString()}</td>
      <td>${r.customerName}<br><small>${r.phone}</small></td>
      <td>${r.vehicle}</td>
      <td>Service #${r.serviceId}</td>
      <td>${r.notes || '-'}</td>
      <td>
        <select class="status-select" data-id="${r.id}">
          <option value="pending" ${r.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="in-progress" ${r.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
          <option value="completed" ${r.status === 'completed' ? 'selected' : ''}>Completed</option>
        </select>
      </td>
    </tr>
  `).join('');

  // Attach change handlers for status updates
  document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      const id = e.target.dataset.id;
      const status = e.target.value;
      await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ status })
      });
      loadRequests();
    });
  });
}

function updateBadge(requests) {
  const unseenCount = requests.filter(r => !r.seen).length;
  if (unseenCount > 0) {
    newBadge.style.display = 'inline-block';
    newBadge.textContent = `${unseenCount} new`;
  } else {
    newBadge.style.display = 'none';
  }
}

document.getElementById('refreshBtn').addEventListener('click', async () => {
  // Mark everything as seen once the mechanic actively checks the dashboard
  await fetch('/api/requests/mark-seen', {
    method: 'POST',
    headers: { 'Authorization': token }
  });
  loadRequests();
});

document.getElementById('logoutLink').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('mechanicToken');
  window.location.href = 'login.html';
});

// Initial load, then poll every 10 seconds for new requests (simple "instant" notification)
loadRequests();
setInterval(loadRequests, 10000);
