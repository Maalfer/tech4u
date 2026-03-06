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
        console.log('Navigating to login...');
        await page.goto('http://localhost:5173/login', { waitUntil: 'load', timeout: 5000 });

        console.log('Filling credentials...');
        await page.fill('input[type="email"]', 'admin@tech4u.es');
        await page.fill('input[type="password"]', 'Tecnologia4u_2024!');

        console.log('Clicking login...');
        await page.click('button[type="submit"]');

        console.log('Waiting for navigation...');
        await page.waitForTimeout(4000);

        await page.screenshot({ path: 'screenshot_after_login.png' });
        console.log('Screenshot saved to screenshot_after_login.png');
    } catch (e) {
        console.log("Error:", e.message);
    }

    await browser.close();
})();
