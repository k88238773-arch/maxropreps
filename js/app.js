// ==========================================
// MAXROPREPS ENGINE & DATABASE STORAGE
// ==========================================

function getPlayersFromStorage() {
    try {
        const players = localStorage.getItem("mr_players_db");
        return players ? JSON.parse(players) : [];
    } catch (e) {
        console.error("Database read error:", e);
        return [];
    }
}

function savePlayersToStorage(playersArray) {
    localStorage.setItem("mr_players_db", JSON.stringify(playersArray));
}

function getActivityFromStorage() {
    const activity = localStorage.getItem("mr_activity_db");
    return activity ? JSON.parse(activity) : [];
}

function saveActivityToStorage(activityArray) {
    localStorage.setItem("mr_activity_db", JSON.stringify(activityArray));
}

function getClipsFromStorage() {
    const clips = localStorage.getItem("mr_clips_db");
    return clips ? JSON.parse(clips) : [];
}

function saveClipsToStorage(clipsArray) {
    localStorage.setItem("mr_clips_db", JSON.stringify(clipsArray));
}

function getCoachesFromStorage() {
    const coaches = localStorage.getItem("mr_coaches_db");
    return coaches ? JSON.parse(coaches) : [
        { name: "Coach_Gump", league: "Elite RFL League" },
        { name: "Recruit_Director_X", league: "UFR Football League" }
    ];
}

let selectedSignupPositions = [];

// ==========================================
// SESSION MANAGEMENT & NAVBAR
// ==========================================

function getSessionUser() {
    return localStorage.getItem("maxropreps_user") || null;
}

function renderGlobalNavbar() {
    const navbar = document.getElementById("global-navbar");
    if (!navbar) return;

    const user = getSessionUser();
    const currentFile = window.location.pathname.split("/").pop() || "index.html";

    let navLinksHtml = `
        <div class="logo" style="font-weight: 900; letter-spacing: 1px;">MAXROPREPS</div>
        <div class="nav-links">
            <a href="index.html" class="${currentFile === 'index.html' ? 'active' : ''}">HOME</a>
            <a href="players.html" class="${currentFile === 'players.html' ? 'active' : ''}">PLAYERS</a>
            <a href="rankings.html" class="${currentFile === 'rankings.html' ? 'active' : ''}">RANKINGS</a>
            <a href="explore.html" class="${currentFile === 'explore.html' ? 'active' : ''}">EXPLORE</a>
            <a href="activity.html" class="${currentFile === 'activity.html' ? 'active' : ''}">ACTIVITY</a>
            <a href="coaches.html" class="${currentFile === 'coaches.html' ? 'active' : ''}">COACHES</a>
        </div>
    `;

    let navRightHtml = user ? `
        <div class="nav-right">
            <a href="messages.html" class="login-link">💬 DMs</a>
            <a href="profile.html?user=${user}" class="login-link">👤 Profile</a>
            <a href="#" class="login-link" onclick="handleSignOut(event)">➡️ Sign Out</a>
        </div>
    ` : `
        <div class="nav-right">
            <a href="login.html" class="login-link">→] Login</a>
            <a href="signup.html" class="join-btn">Join Now</a>
        </div>
    `;

    navbar.innerHTML = navLinksHtml + navRightHtml;
}

// ==========================================
// REGISTRATION & AUTH HANDLERS
// ==========================================

function togglePositionSelection(element) {
    const val = element.getAttribute("data-value");
    if (element.classList.contains("selected")) {
        element.classList.remove("selected");
        selectedSignupPositions = selectedSignupPositions.filter(p => p !== val);
    } else {
        element.classList.add("selected");
        selectedSignupPositions.push(val);
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    try {
        const usernameEl = document.getElementById("username");
        const robloxUsernameEl = document.getElementById("robloxUsername");
        const discordUsernameEl = document.getElementById("discordUsername");
        const passwordEl = document.getElementById("password");

        if (!usernameEl || !robloxUsernameEl || !discordUsernameEl || !passwordEl) {
            alert("⚠️ Registration Error: Input target fields missing matching IDs.");
            return;
        }

        const username = usernameEl.value.trim();
        const robloxUsername = robloxUsernameEl.value.trim();
        const discordUsername = discordUsernameEl.value.trim();
        const password = passwordEl.value;

        if (selectedSignupPositions.length === 0) {
            alert("Please select at least one Position tile until it highlights!");
            return;
        }

        let currentDB = getPlayersFromStorage();
        if (currentDB.some(p => p.username.toLowerCase() === username.toLowerCase())) {
            alert("This nickname/username is already taken!");
            return;
        }

        const newProfile = {
            username: username,
            roblox: robloxUsername,
            discord: discordUsername,
            password: password,
            positions: [...selectedSignupPositions],
            rating: 0,
            team: "Uncommitted",
            offers: "No offers yet.",
            bio: "No bio set yet.",
            videoUrl: "" 
        };

        currentDB.unshift(newProfile);
        savePlayersToStorage(currentDB);

        localStorage.setItem("maxropreps_user", username);
        alert(`Welcome to MAXROPREPS, ${username}! Your profile has been created.`);
        window.location.href = "index.html";

    } catch (err) {
        alert("Registration failed: " + err.message);
    }
}

function handleLogin(e) {
    e.preventDefault();
    try {
        const userEl = document.getElementById("login-username");
        const passEl = document.getElementById("login-password");

        const user = userEl.value.trim();
        const pass = passEl.value;

        const currentDB = getPlayersFromStorage();
        const foundUser = currentDB.find(p => p.username.toLowerCase() === user.toLowerCase());

        if (!foundUser || foundUser.password !== pass) {
            alert("Invalid credentials entered.");
            return;
        }

        localStorage.setItem("maxropreps_user", foundUser.username);
        window.location.href = "index.html";
    } catch(err) {
        alert("Login missing configuration: " + err.message);
    }
}

function handleSignOut(e) {
    e.preventDefault();
    localStorage.removeItem("maxropreps_user");
    window.location.href = "index.html";
}

// ==========================================
// INTERACTIVE COMPONENT STREAM LIFECYCLES
// ==========================================

function loadPlayersPage() {
    const grid = document.getElementById("master-players-grid");
    if (!grid) return;

    const list = getPlayersFromStorage();
    if (list.length === 0) {
        grid.innerHTML = `<div class="card" style="grid-column:1/-1; text-align:center; padding:30px; color:var(--text-muted);">No player records found.</div>`;
        return;
    }

    grid.innerHTML = list.map(p => `
        <div class="player-profile-clickable-card" onclick="window.location.href='profile.html?user=${p.username}'">
            <div class="avatar-icon-placeholder">👤</div>
            <div class="player-card-details">
                <div class="player-card-header">
                    <p class="player-card-name">${p.username}</p>
                    <div class="badge-group">${p.positions.map(pos => `<span class="badge">${pos}</span>`).join('')}</div>
                </div>
                <p class="player-card-handle">@${p.roblox}</p>
                <div style="color:var(--brand-yellow); font-size:12px; margin: 4px 0;">
                    ${p.rating > 0 ? "★".repeat(p.rating) : "☆☆☆☆☆ Unrated"}
                </div>
                <div style="font-size:12px; color:var(--brand-blue); font-weight:bold; margin-top:5px;">🏫 ${p.team}</div>
            </div>
        </div>
    `).join('');
}

function parseAndLoadProfileView() {
    const target = document.getElementById("dynamic-profile-view");
    if (!target) return;

    const urlParams = new URLSearchParams(window.location.search);
    const targetUser = urlParams.get("user");
    const currentDB = getPlayersFromStorage();
    const profile = currentDB.find(p => p.username.toLowerCase() === (targetUser || "").toLowerCase());

    if (!profile) {
        target.innerHTML = `<div class="card"><h2>Profile Not Found</h2></div>`;
        return;
    }

    target.innerHTML = `
        <div class="card" style="padding: 30px; margin-bottom:20px;">
            <div style="display:flex; gap:25px; align-items:center;">
                <div style="width:70px; height:70px; background:#131a2e; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:32px;">👤</div>
                <div>
                    <h1 style="margin:0 0 6px 0; font-size:28px;">
                        ${profile.username}
                        <div class="badge-group">${profile.positions.map(pos => `<span class="badge">${pos}</span>`).join('')}</div>
                    </h1>
                    <div style="color:var(--brand-yellow); font-size:16px; margin-bottom:8px;">${profile.rating > 0 ? "★".repeat(profile.rating) : "☆☆☆☆☆ Unrated"}</div>
                    <div style="font-size:13px; color:var(--text-muted);">
                        <div>🎮 <strong>Roblox Name:</strong> @${profile.roblox}</div>
                        <div>🔮 <strong>Discord Handle:</strong> ${profile.discord}</div>
                    </div>
                </div>
            </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
            <div class="card">
                <h3 style="margin-top:0; font-size:12px; color:var(--text-muted);">COMMITMENT STATUS</h3>
                <p style="font-size:16px; font-weight:bold; margin:5px 0 0 0; color: var(--brand-blue);">${profile.team}</p>
            </div>
            <div class="card">
                <h3 style="margin-top:0; font-size:12px; color:var(--text-muted);">OFFERS EXTENDED</h3>
                <p style="font-size:14px; margin:5px 0 0 0; color:#fff;">${profile.offers}</p>
            </div>
        </div>

        <div class="card" style="margin-top: 20px; padding: 22px; border: 1px dashed var(--brand-blue);">
            <h3 style="margin-top:0; font-size:14px; color:var(--brand-blue);">🏈 RATING MANAGEMENT PANEL</h3>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                <div>
                    <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">Star Rating (1-5)</label>
                    <input type="number" id="update-rating" min="0" max="5" value="${profile.rating}">
                </div>
                <div>
                    <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">Set Commitment</label>
                    <input type="text" id="update-team" value="${profile.team}">
                </div>
            </div>
            <div style="margin-bottom: 12px;">
                <label style="font-size:11px; color:var(--text-muted); display:block; margin-bottom:4px;">Offers Sheet List</label>
                <input type="text" id="update-offers" value="${profile.offers}" style="width:100%;">
            </div>
            <button class="join-btn" onclick="saveAdminUpdates('${profile.username}')" style="width:100%; border:none; padding:10px;">Update Profile Metrics</button>
        </div>
    `;
}

function saveAdminUpdates(username) {
    let currentDB = getPlayersFromStorage();
    let idx = currentDB.findIndex(p => p.username.toLowerCase() === username.toLowerCase());

    if (idx !== -1) {
        const oldRating = currentDB[idx].rating;
        const newRating = parseInt(document.getElementById("update-rating").value) || 0;
        
        currentDB[idx].rating = newRating;
        currentDB[idx].team = document.getElementById("update-team").value.trim() || "Uncommitted";
        currentDB[idx].offers = document.getElementById("update-offers").value.trim() || "No offers yet.";

        savePlayersToStorage(currentDB);

        if (oldRating !== newRating) {
            let activityLogs = getActivityFromStorage();
            activityLogs.unshift({
                text: `Evaluators updated **${username}** rating from ${oldRating}★ to ${newRating}★`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            saveActivityToStorage(activityLogs);
        }

        alert("Profile metrics saved successfully!");
        parseAndLoadProfileView();
    }
}

// ==========================================
// EXPLORE SUBMISSION POSTING HANDLERS
// ==========================================

function loadExplorePage() {
    const postFormWrapper = document.getElementById("explore-post-form-wrapper");
    const output = document.getElementById("explore-videos-output");
    
    if (!output) return;

    const user = getSessionUser();
    
    if (postFormWrapper) {
        if (user) {
            postFormWrapper.innerHTML = `
                <div class="card" style="margin-bottom: 25px;">
                    <h2 style="font-size: 15px; margin: 0 0 15px 0; color: var(--brand-blue);">🚀 POST GAMEPLAY HIGHLIGHT TAPE</h2>
                    <form onsubmit="handlePostClip(event)">
                        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 10px;">
                            <input type="text" id="clipTitle" placeholder="Name your highlight achievement..." required>
                            <input type="text" id="clipTag" placeholder="Position (e.g. QB)" required>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <input type="url" id="clipUrl" placeholder="Paste Video Link (YouTube or Streamable URL)" required>
                        </div>
                        <button type="submit" class="join-btn" style="width: 100%; padding: 12px; border: none; font-weight: bold;">Post Clip to Board Feed</button>
                    </form>
                </div>
            `;
        } else {
            postFormWrapper.innerHTML = `
                <div class="card" style="margin-bottom: 25px; text-align: center; padding: 20px; border: 1px dashed var(--border-color);">
                    <p style="color: var(--text-muted); margin: 0; font-size: 14px;">
                        Want to share your highlight tapes? <a href="login.html" style="color: var(--brand-blue); font-weight: bold; text-decoration: none;">Sign In</a> or <a href="signup.html" style="color: var(--brand-yellow); font-weight: bold; text-decoration: none;">Register</a> to post gameplay films.
                    </p>
                </div>
            `;
        }
    }

    const clips = getClipsFromStorage();
    if (clips.length === 0) {
        output.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:30px; margin:0;">No player gameplay clips logged yet.</p>`;
        return;
    }

    output.innerHTML = clips.map(c => `
        <div class="card" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <strong style="font-size:16px; color:#fff;">🎬 ${c.title}</strong>
                <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">Posted by: <strong>${c.user}</strong></div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <span class="badge">${c.tag}</span>
                <a href="${c.videoUrl}" target="_blank" class="join-btn" style="text-decoration:none; padding:8px 14px; background-color: #1e293b; color: var(--brand-blue); border: 1px solid var(--border-color);">Watch Film</a>
            </div>
        </div>
    `).join('');
}

function handlePostClip(e) {
    e.preventDefault();
    const user = getSessionUser();
    if (!user) return;

    const title = document.getElementById("clipTitle").value.trim();
    const tag = document.getElementById("clipTag").value.trim();
    const videoUrl = document.getElementById("clipUrl").value.trim();

    let clips = getClipsFromStorage();
    clips.unshift({ user, title, tag, videoUrl });
    saveClipsToStorage(clips);

    let activityLogs = getActivityFromStorage();
    activityLogs.unshift({
        text: `Player **${user}** published a new highlight clip: *"${title}"*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    saveActivityToStorage(activityLogs);

    alert("Gameplay clip successfully added to explore feed!");
    loadExplorePage();
}

// ==========================================
// SECONDARY RECRUIT LIST GENERATORS
// ==========================================

function loadRankingsPage() {
    const output = document.getElementById("rankings-list-output");
    if (!output) return;

    const players = getPlayersFromStorage();
    const sorted = players.sort((a, b) => b.rating - a.rating);

    if (sorted.length === 0) {
        output.innerHTML = `<div class="card" style="text-align:center; color:var(--text-muted);">No ranked players registered yet.</div>`;
        return;
    }

    output.innerHTML = sorted.map((p, i) => `
        <div class="card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; cursor:pointer;" onclick="window.location.href='profile.html?user=${p.username}'">
            <div style="display:flex; align-items:center; gap:15px;">
                <span style="font-size:18px; font-weight:bold; color:var(--brand-yellow);">#${i+1}</span>
                <div>
                    <strong style="font-size:15px;">${p.username}</strong>
                    <div style="font-size:12px; color:var(--text-muted);">${p.positions.join(', ')}</div>
                </div>
            </div>
            <div style="text-align:right;">
                <div style="color:var(--brand-yellow); font-size:13px;">${p.rating > 0 ? "★".repeat(p.rating) : "Unrated"}</div>
                <div style="font-size:11px; color:var(--brand-blue); font-weight:bold;">${p.team}</div>
            </div>
        </div>
    `).join('');
}

function loadActivityPage() {
    const output = document.getElementById("activity-logs-output");
    if (!output) return;

    const logs = getActivityFromStorage();
    if (logs.length === 0) {
        output.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:10px; margin:0;">No activity actions logged yet.</p>`;
        return;
    }

    output.innerHTML = logs.map(l => `
        <div style="padding:12px; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between; font-size:13px;">
            <span>⚡ ${l.text}</span>
            <span style="color:var(--text-muted); font-size:11px;">${l.timestamp}</span>
        </div>
    `).join('');
}

function loadCoachesPage() {
    const output = document.getElementById("coaches-list-output");
    if (!output) return;

    const coaches = getCoachesFromStorage();
    output.innerHTML = coaches.map(c => `
        <div style="padding:14px; background:#131a2e; border:1px solid var(--border-color); border-radius:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <strong style="font-size:14px; color:#fff;">📋 ${c.name}</strong>
                <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">${c.league}</div>
            </div>
            <div style="background:rgba(59,130,246,0.15); color:var(--brand-blue); font-size:11px; padding:4px 8px; border-radius:4px; font-weight:bold;">✓ VERIFIED COACH</div>
        </div>
    `).join('');
}

window.onload = function() {
    renderGlobalNavbar();
    loadPlayersPage();
    parseAndLoadProfileView();
    loadRankingsPage();
    loadActivityPage();
    loadCoachesPage();
    loadExplorePage();
};
