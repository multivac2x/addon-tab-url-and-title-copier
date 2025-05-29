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
  
  // Remove excessive whitespace and newlines
  title = title.replace(/\s+/g, ' ').trim();
  
  // Limit title length for better readability
  if (title.length > 80) {
    title = title.substring(0, 77) + '...';
  }
  
  return title;
}

copyTabsButton.addEventListener('click', async () => {
  try {
    const tabs = await browser.tabs.query({ currentWindow: true });
    
    // Filter out all about: pages that aren't useful URLs
    const validTabs = tabs.filter(tab => !tab.url.startsWith('about:'));
    
    // Process each tab to include title and cleaned URL
    const tabData = validTabs.map(tab => {
      const cleanedUrl = cleanYouTubeUrl(tab.url);
      const cleanedTitle = cleanPageTitle(tab.title);
      
      // Format: "Page Title | URL"
      return `${cleanedTitle} | ${cleanedUrl}`;
    });
    
    const tabsString = tabData.join('\n');

    await navigator.clipboard.writeText(tabsString);
    statusMessage.textContent = `Copied ${validTabs.length} tab(s) with titles and URLs!`;
    
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