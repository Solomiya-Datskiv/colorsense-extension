const box = document.getElementById('on');
chrome.storage.local.get({ enabled: true }, r => { box.checked = r.enabled; });
box.addEventListener('change', () => chrome.storage.local.set({ enabled: box.checked }));