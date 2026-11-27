let members = [];

async function loadMembers() {
  try {
    const response = await fetch("/api/members");
    members = await response.json();
    updateStats();
    renderMembers();
  } catch (error) {
    document.getElementById("teamGrid").innerHTML =
      '<p class="empty">Cannot connect to the server. Please refresh.</p>';
  }
}

function updateStats() {
  document.getElementById("total").textContent = members.length;
  ["Available", "Busy", "Away"].forEach(status => {
    document.getElementById(status.toLowerCase()).textContent =
      members.filter(member => member.status === status).length;
  });
}

function renderMembers() {
  const search = document.getElementById("search").value.toLowerCase();
  const role = document.getElementById("roleFilter").value;
  const status = document.getElementById("statusFilter").value;

  const filtered = members.filter(member =>
    member.name.toLowerCase().includes(search) &&
    (role === "All" || member.role === role) &&
    (status === "All" || member.status === status)
  );

  document.getElementById("shown").textContent = `${filtered.length} members`;
  const grid = document.getElementById("teamGrid");

  if (!filtered.length) {
    grid.innerHTML = '<p class="empty">No team members found.</p>';
    return;
  }

  grid.innerHTML = filtered.map(member => `
    <article class="member">
      <div class="member-top">
        <div class="avatar">${member.name.split(" ").map(x => x[0]).join("")}</div>
        <div>
          <h3>${member.name}</h3>
          <div class="role">${member.role}</div>
        </div>
      </div>
      <div class="status-line">
        <span class="pill ${member.status}">${member.status}</span>
        <select class="status-select" aria-label="Change status for ${member.name}"
          onchange="changeStatus(${member.id}, this.value)">
          <option ${member.status === "Available" ? "selected" : ""}>Available</option>
          <option ${member.status === "Busy" ? "selected" : ""}>Busy</option>
          <option ${member.status === "Away" ? "selected" : ""}>Away</option>
        </select>
      </div>
      <div class="timezone">🌐 ${member.timezone.replaceAll("_", " ")}</div>
    </article>
  `).join("");
}

async function changeStatus(id, status) {
  const response = await fetch(`/api/members/${id}`, {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({status})
  });
  if (!response.ok) {
    alert("Could not update status. Please try again.");
    return;
  }
  await loadMembers();
}

loadMembers();
setInterval(loadMembers, 5000);
