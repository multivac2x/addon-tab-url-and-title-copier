const copyTabsButton = document.getElementById('copy-tabs-button');
const statusMessage = document.getElementById('status-message');

copyTabsButton.addEventListener('click', async () => {
  try {
    const tabs = await browser.tabs.query({ currentWindow: true });
    const urls = tabs.map(tab => tab.url);
    const urlsString = urls.join('\\n');

    await navigator.clipboard.writeText(urlsString);
    statusMessage.textContent = `Copied ${urls.length} tab URL(s)!`;
    // Clear the message after a few seconds
    setTimeout(() => {
      statusMessage.textContent = '';
    }, 3000);

  } catch (error) {
    console.error("Error copying tab URLs:", error);
    statusMessage.textContent = 'Error copying URLs.';
     // Clear the message after a few seconds
    setTimeout(() => {
      statusMessage.textContent = '';
    }, 3000);
  }
});