// ============ GLOBAL SETTINGS INITIALIZATION ============

// Apply saved dark mode on every page load
const isDarkMode = localStorage.getItem('darkMode') === 'true';
if (isDarkMode) {
  document.body.classList.add('dark');
}

// ============ SETTINGS PAGE HANDLERS ============

// Dark Mode Toggle
const darkToggle = document.getElementById('darkModeToggle');
if (darkToggle) {
  darkToggle.checked = isDarkMode; // Reflect saved state

  darkToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark', darkToggle.checked);
    localStorage.setItem('darkMode', darkToggle.checked);
  });
}

// Background Music Toggle
const musicToggle = document.getElementById('musicToggle');
const bgMusic = new Audio('https://cdn.pixabay.com/download/audio/2023/06/16/audio_f2f69dc3db.mp3?filename=relaxing-background-music-146716.mp3');

if (musicToggle) {
  const savedMusic = localStorage.getItem('music') === 'true';
  musicToggle.checked = savedMusic;

  if (savedMusic) {
    bgMusic.loop = true;
    bgMusic.play();
  }

  musicToggle.addEventListener('change', () => {
    localStorage.setItem('music', musicToggle.checked);
    if (musicToggle.checked) {
      bgMusic.loop = true;
      bgMusic.play();
    } else {
      bgMusic.pause();
    }
  });
}

// Voice Prompt Toggle
const voiceToggle = document.getElementById('voiceToggle');
if (voiceToggle) {
  const savedVoice = localStorage.getItem('voice') === 'true';
  voiceToggle.checked = savedVoice;

  voiceToggle.addEventListener('change', () => {
    localStorage.setItem('voice', voiceToggle.checked);
  });
}

// ============ WORKSHEET PROGRESS ============

function completeWorksheet(level) {
  const completed = JSON.parse(localStorage.getItem('completedWorksheets') || '[]');
  if (!completed.includes(level)) {
    completed.push(level);
    localStorage.setItem('completedWorksheets', JSON.stringify(completed));
  }

  // Voice feedback or alert
  const voiceEnabled = localStorage.getItem('voice') === 'true';
  if (voiceEnabled && 'speechSynthesis' in window) {
    const msg = new SpeechSynthesisUtterance("Uh-oh, try again!");
    window.speechSynthesis.speak(msg);
  } else {
    alert(`✅ You completed the ${level} worksheet!`);
  }

  showProgress();
}

function showProgress() {
  const progressDiv = document.getElementById('progress');
  if (progressDiv) {
    const completed = JSON.parse(localStorage.getItem('completedWorksheets') || '[]');
    progressDiv.innerHTML = `<p><strong>Completed Worksheets:</strong> ${completed.join(', ') || 'None yet'}</p>`;
  }
}
showProgress();

// ============ ADMIN LOGIN ============

const adminForm = document.getElementById('adminForm');
if (adminForm) {
  adminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    if (password === 'admin123') {
      alert('Access granted!');
      // Redirect to admin dashboard (future)
    } else {
      alert('Incorrect password. Redirecting to Home...');
      window.location.href = 'index.html';
    }
  });
}
