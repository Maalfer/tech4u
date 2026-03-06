import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('\x1b[31mPAGE LOG ERROR:\x1b[0m', msg.text());
        } else {
            console.log('PAGE LOG:', msg.text());
        }
    });

    page.on('pageerror', err => {
        console.log('\x1b[31mPAGE ERROR EXCEPTION:\x1b[0m', err.message);
    });

    try {
        await page.goto('http://localhost:5173/admin-dashboard', { waitUntil: 'load', timeout: 10000 });
        // Wait a bit to ensure async errors are caught
        await page.waitForTimeout(2000);
    } catch (e) {
        console.log("Navigation error:", e.message);
    }

    await browser.close();
})();
