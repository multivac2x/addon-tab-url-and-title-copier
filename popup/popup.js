// Browser namespace shim
if (typeof browser === 'undefined' && typeof chrome !== 'undefined') {
  var browser = chrome;
}

// DOM elements
const copyTabsButton = document.getElementById('copy-tabs-button');
const statusMessage = document.getElementById('status-message');

// Save checkbox states to local storage
function saveCheckboxStates() {
  const states = {
    filterGoogleDrive: document.getElementById('filter-google-drive').checked,
    filterWhatsApp: document.getElementById('filter-whatsapp').checked,
    filterGitHub: document.getElementById('filter-github').checked,
    filterClaude: document.getElementById('filter-claude').checked,
    filterAboutPages: document.getElementById('filter-about-pages').checked
  };
  browser.storage.local.set({ filterStates: states });
}

// Load checkbox states from local storage
async function loadCheckboxStates() {
  try {
    const result = await browser.storage.local.get('filterStates');
    if (result.filterStates) {
      const states = result.filterStates;
      document.getElementById('filter-google-drive').checked = states.filterGoogleDrive ?? true;
      document.getElementById('filter-whatsapp').checked = states.filterWhatsApp ?? true;
      document.getElementById('filter-github').checked = states.filterGitHub ?? true;
      document.getElementById('filter-claude').checked = states.filterClaude ?? true;
      document.getElementById('filter-about-pages').checked = states.filterAboutPages ?? true;
    }
  } catch (error) {
    console.log('No saved filter states found, using defaults');
  }
}

// Initialize checkbox event listeners
function initializeCheckboxListeners() {
  const checkboxes = [
    'filter-google-drive',
    'filter-whatsapp',
    'filter-github',
    'filter-claude',
    'filter-about-pages'
  ];
  checkboxes.forEach(id => {
    const checkbox = document.getElementById(id);
    if (checkbox) {
      checkbox.addEventListener('change', saveCheckboxStates);
    }
  });
}

// Function to clean YouTube URLs by removing unnecessary parameters
function cleanYouTubeUrl(url) {
  try {
    const urlObj = new URL(url);
    if (
      urlObj.hostname === 'www.youtube.com' ||
      urlObj.hostname === 'youtube.com' ||
      urlObj.hostname === 'm.youtube.com'
    ) {
      if (urlObj.pathname === '/watch') {
        const videoId = urlObj.searchParams.get('v');
        if (videoId) {
          return `https://www.youtube.com/watch?v=${videoId}`;
        }
      } else if (urlObj.pathname === '/watch' && urlObj.searchParams.has('list')) {
        const videoId = urlObj.searchParams.get('v');
        const playlistId = urlObj.searchParams.get('list');
        if (videoId && playlistId) {
          return `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`;
        } else if (playlistId) {
          return `https://www.youtube.com/playlist?list=${playlistId}`;
        }
      } else if (
        urlObj.pathname.startsWith('/channel/') ||
        urlObj.pathname.startsWith('/c/') ||
        urlObj.pathname.startsWith('/@')
      ) {
        return `https://www.youtube.com${urlObj.pathname}`;
      }
    }
    return url;
  } catch (error) {
    return url;
  }
}

// Function to clean and format page titles
function cleanPageTitle(title) {
  if (!title) return 'Untitled Page';
  if (title.includes(' - YouTube')) {
    title = title.replace(' - YouTube', '');
  }
  title = title.replace(/\(\d+\)\s*/g, '');
  title = title.replace(/\s+/g, ' ').trim();
  title = title.replace(/"/g, '""');
  if (title.length > 80) {
    title = title.substring(0, 77) + '...';
  }
  return title;
}

// Function to check if a URL should be excluded based on checkbox states
function shouldExcludeUrl(url) {
  const filterGoogleDrive = document.getElementById('filter-google-drive').checked;
  const filterWhatsApp = document.getElementById('filter-whatsapp').checked;
  const filterGitHub = document.getElementById('filter-github').checked;
  const filterClaude = document.getElementById('filter-claude').checked;

  if (filterGoogleDrive) {
    if (
      url === 'https://drive.google.com/drive/home' ||
      url.startsWith('https://drive.google.com/drive/home')
    ) {
      return true;
    }
  }
  if (filterWhatsApp && url.startsWith('https://web.whatsapp.com/')) {
    return true;
  }
  if (filterGitHub && url.startsWith('https://github.com/multivac2x')) {
    return true;
  }
  if (filterClaude) {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'claude.ai') {
        return true;
      }
    } catch (error) {
      /* ignore */
    }
  }
  return false;
}

// Main copy tabs functionality
copyTabsButton.addEventListener('click', async () => {
  try {
    const tabs = await browser.tabs.query({ currentWindow: true });
    const filterAboutPages = document.getElementById('filter-about-pages').checked;
    const validTabs = tabs.filter(tab => {
      if (filterAboutPages && tab.url.startsWith('about:')) {
        return false;
      }
      return !shouldExcludeUrl(tab.url);
    });
    const tabData = validTabs.map(tab => ({
      url: cleanYouTubeUrl(tab.url),
      title: cleanPageTitle(tab.title)
    }));
    const csvRows = tabData.map(tab => `"${tab.url}","${tab.title}"`);
    const csvHeader = '"URL","Title"';
    const csvString = [csvHeader, ...csvRows].join('\n');
    await navigator.clipboard.writeText(csvString);
    statusMessage.textContent = `Copied ${validTabs.length} tab(s) as CSV format!`;
    setTimeout(() => {
      statusMessage.textContent = '';
    }, 4000);
  } catch (error) {
    console.error('Error copying tab data:', error);
    statusMessage.textContent = 'Error copying tab data.';
    setTimeout(() => {
      statusMessage.textContent = '';
    }, 3000);
  }
});

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', async () => {
  await loadCheckboxStates();
  initializeCheckboxListeners();
});