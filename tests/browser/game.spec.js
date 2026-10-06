import { test, expect } from '@playwright/test';

const point = (page, id) => page.locator(`[data-point="${id}"]`).click();
const act = (page, id) => page.locator(`[data-action="${id}"]`).click();
const district = (page, id) => page.locator(`[data-district="${id}"]`).click();

async function investigate(page) {
  await page.goto('/');
  await point(page, 'body'); await act(page, 'burn');
  await point(page, 'kiosk'); await act(page, 'memory');
  await point(page, 'lu'); await act(page, 'lu-talk');
  await point(page, 'radio'); await act(page, 'radio-tune');
  await expect(page.locator('#credits')).toContainText('150');
  await district(page, 'market');
  await point(page, 'noodle'); await act(page, 'receipt'); await act(page, 'eat');
  await expect(page.locator('#credits')).toContainText('135');
  await expect(page.locator('[data-action="eat"]')).toBeDisabled();
  await point(page, 'broker'); await act(page, 'alibi');
  await district(page, 'clinic'); await point(page, 'han'); await act(page, 'han-talk');
  await point(page, 'lab'); await act(page, 'protocol');
  await district(page, 'tower'); await point(page, 'n7');
  await expect(page.locator('[data-action="witness"]')).toBeDisabled();
  await point(page, 'terminal'); await act(page, 'decrypt');
  await page.locator('#passcode').fill('1234'); await page.locator('#decrypt-form button').click();
  await expect(page.locator('#puzzle-message')).toContainText('密码错误');
  await page.locator('#passcode').fill('0417'); await page.locator('#decrypt-form button').click();
  await expect(page.locator('#modal')).not.toBeVisible();
  await point(page, 'n7'); await act(page, 'witness');
  await page.locator('#open-case').click();
  await expect(page.locator('.evidence-card.found')).toHaveCount(9);
  await page.selectOption('#suspect', 'han'); await page.selectOption('#method', 'overload'); await page.selectOption('#motive', 'audit');
  await page.locator('#deduction-form button').click();
  await expect(page.locator('#deduction-message')).toContainText('存在矛盾');
  await page.selectOption('#suspect', 'wu'); await page.locator('#deduction-form button').click();
  await expect(page.locator('.case-state')).toHaveText('真相已确认');
}

for (const choice of ['publish', 'protect']) {
  test(`complete investigation and ${choice} ending survive reload`, async ({ page }) => {
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await investigate(page);
    await page.locator(`[data-ending="${choice}"]`).click();
    await expect(page.locator('.case-state')).toHaveText('已结案');
    await expect(page.locator('.deduction-panel h3')).toHaveText(choice === 'publish' ? '结局 · 第一束晨光' : '结局 · 她自己的名字');
    await page.reload(); await expect(page.locator('#credits')).toContainText('335');
    await page.locator('#open-case').click(); await expect(page.locator('.case-state')).toHaveText('已结案');
    await page.locator('#case-view [data-clue="directive"]').click(); await expect(page.locator('#modal h2')).toHaveText('吴监理的签名指令');
    await page.keyboard.press('Escape');
    await page.locator('#reset').click(); await page.locator('#cancel-reset').click();
    await expect(page.locator('.case-state')).toHaveText('已结案');
    await page.locator('#reset').click(); await page.locator('#confirm-reset').click();
    await expect(page.locator('#progress-text')).toHaveText('0 / 9 线索');
    await expect(page.locator('#credits')).toContainText('120');
    expect(errors).toEqual([]);
  });
}

test('mobile controls, keyboard movement, help and incomplete deduction', async ({ page }) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto('/');
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await page.locator('#help').click(); await expect(page.locator('#modal h2')).toHaveText('欢迎来到雨港。'); await page.keyboard.press('Escape');
  await page.locator('#city').click({position: {x: 175, y: 300}});
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('rainharbor.save.v1')).player.x);
  await page.keyboard.down('d'); await page.waitForTimeout(300); await page.keyboard.up('d');
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('rainharbor.save.v1')).player.x);
  expect(after).toBeGreaterThan(before);
  await page.keyboard.press('e');
  await page.locator('#sound').click(); await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#sound').click(); await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('#open-case').click(); await expect(page.locator('#deduction-form button')).toBeDisabled();
  await expect(page.locator('.evidence-card.found')).toHaveCount(0);
  await page.locator('[data-tab="world"]').click(); await district(page, 'clinic'); await point(page, 'han');
  await expect(page.locator('[data-action="han-talk"]')).toBeDisabled();
  await page.reload(); await expect(page.locator('#map-title')).toHaveText('白噪诊所');
});
