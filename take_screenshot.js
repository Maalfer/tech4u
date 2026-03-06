import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        await page.goto('http://localhost:5173/admin-dashboard', { waitUntil: 'load', timeout: 5000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screenshot.png' });
        console.log('Screenshot saved to screenshot.png');
    } catch (e) {
        console.log("Error:", e.message);
    }

    await browser.close();
})();
