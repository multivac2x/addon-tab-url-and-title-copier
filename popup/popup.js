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
    document.getElementById(id).addEventListener('change', saveCheckboxStates);
  });
}

// Load states when popup opens
document.addEventListener('DOMContentLoaded', () => {
  loadCheckboxStates();
  initializeCheckboxListeners();
});

// Function to clean YouTube URLs by removing unnecessary parameters
function cleanYouTubeUrl(url) {
  try {
    const urlObj = new URL(url);
    
    // Check if it's a YouTube URL
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com' || urlObj.hostname === 'm.youtube.com') {
      // For watch URLs, keep only the video ID
      if (urlObj.pathname === '/watch') {
        const videoId = urlObj.searchParams.get('v');
        if (videoId) {
          return `https://www.youtube.com/watch?v=${videoId}`;
        }
      }
      // For playlist URLs, keep video and playlist IDs
      else if (urlObj.pathname === '/watch' && urlObj.searchParams.has('list')) {
        const videoId = urlObj.searchParams.get('v');
        const playlistId = urlObj.searchParams.get('list');
        if (videoId && playlistId) {
          return `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`;
        } else if (playlistId) {
          return `https://www.youtube.com/playlist?list=${playlistId}`;
        }
      }
      // For channel URLs, keep the channel path
      else if (urlObj.pathname.startsWith('/channel/') || urlObj.pathname.startsWith('/c/') || urlObj.pathname.startsWith('/@')) {
        return `https://www.youtube.com${urlObj.pathname}`;
      }
    }
    
    // For non-YouTube URLs or unrecognized YouTube patterns, return as-is
    return url;
  } catch (error) {
    // If URL parsing fails, return original URL
    return url;
  }
}

// Function to clean and format page titles
function cleanPageTitle(title) {
  if (!title) return 'Untitled Page';
  
  // Remove common YouTube title suffixes
  if (title.includes(' - YouTube')) {
    title = title.replace(' - YouTube', '');
  }
  
  // Remove YouTube notification numbers like (28755) or (123)
  title = title.replace(/\(\d+\)\s*/g, '');
  
  // Remove excessive whitespace and newlines
  title = title.replace(/\s+/g, ' ').trim();
  
  // Escape double quotes for CSV format
  title = title.replace(/"/g, '""');
  
  // Limit title length for better readability
  if (title.length > 80) {
    title = title.substring(0, 77) + '...';
  }
  
  return title;
}

// Function to check if a URL should be excluded based on checkbox states
function shouldExcludeUrl(url) {
  // Get checkbox states
  const filterGoogleDrive = document.getElementById('filter-google-drive').checked;
  const filterWhatsApp = document.getElementById('filter-whatsapp').checked;
  const filterGitHub = document.getElementById('filter-github').checked;
  const filterClaude = document.getElementById('filter-claude').checked;
  
  // Check Google Drive exclusion
  if (filterGoogleDrive) {
    if (url === 'https://drive.google.com/drive/home' || url.startsWith('https://drive.google.com/drive/home')) {
      return true;
    }
  }
  
  // Check WhatsApp Web exclusion
  if (filterWhatsApp) {
    if (url.startsWith('https://web.whatsapp.com/')) {
      return true;
    }
  }
  
  // Check GitHub profile exclusion
  if (filterGitHub) {
    if (url.startsWith('https://github.com/multivac2x')) {
      return true;
    }
  }
  
  // Check Claude AI exclusion
  if (filterClaude) {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'claude.ai') {
        return true;
      }
    } catch (error) {
      // If URL parsing fails, don't exclude
    }
  }
  
  return false;
}

copyTabsButton.addEventListener('click', async () => {
  try {
    const tabs = await browser.tabs.query({ currentWindow: true });
    
    // Get about pages filter state
    const filterAboutPages = document.getElementById('filter-about-pages').checked;
    
    // Filter out tabs based on checkbox settings
    const validTabs = tabs.filter(tab => {
      // Check about: pages filter
      if (filterAboutPages && tab.url.startsWith('about:')) {
        return false;
      }
      
      // Check other URL exclusions
      return !shouldExcludeUrl(tab.url);
    });
    
    // Process each tab to create CSV format: URL, Title
    const csvRows = validTabs.map(tab => {
      const cleanedUrl = cleanYouTubeUrl(tab.url);
      const cleanedTitle = cleanPageTitle(tab.title);
      
      // CSV format: "URL","Title" - URL in first column, title in second
      return `"${cleanedUrl}","${cleanedTitle}"`;
    });
    
    // Add CSV header
    const csvHeader = '"URL","Title"';
    const csvString = [csvHeader, ...csvRows].join('\n');

    await navigator.clipboard.writeText(csvString);
    statusMessage.textContent = `Copied ${validTabs.length} tab(s) as CSV format!`;
    
    // Clear the message after a few seconds
    setTimeout(() => {
      statusMessage.textContent = '';
    }, 3000);

  } catch (error) {
    console.error("Error copying tab data:", error);
    statusMessage.textContent = 'Error copying tab data.';
    
    // Clear the message after a few seconds
    setTimeout(() => {
      statusMessage.textContent = '';
    }, 3000);
  }
});