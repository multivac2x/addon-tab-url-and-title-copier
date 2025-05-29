const copyTabsButton = document.getElementById('copy-tabs-button');
const statusMessage = document.getElementById('status-message');

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

// Function to check if a URL should be excluded
function shouldExcludeUrl(url) {
  const excludePatterns = [
    // Google Drive home
    'https://drive.google.com/drive/home',
    // WhatsApp Web
    'https://web.whatsapp.com/',
    // GitHub for multivac2x user
    'https://github.com/multivac2x',
    // Claude AI
    'https://claude.ai'
  ];
  
  // Check exact matches first
  if (excludePatterns.some(pattern => url === pattern || url.startsWith(pattern))) {
    return true;
  }
  
  return false;
}

copyTabsButton.addEventListener('click', async () => {
  try {
    const tabs = await browser.tabs.query({ currentWindow: true });
    
    // Filter out about: pages and excluded URLs
    const validTabs = tabs.filter(tab =>
      !tab.url.startsWith('about:') && !shouldExcludeUrl(tab.url)
    );
    
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