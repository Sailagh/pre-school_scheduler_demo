// Browser test of the planner: empty week, Make schedule form, report, undo, demo, dates, Swedish.
// Needs the demo running (start.py on :8000 with BASE=http://localhost:8000, or cd web && npx http-server -p 5173) and Playwright.
// The solver should NOT be running: the test uses the saved schedule.     Run: node tests/e2e.cjs
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const assert = require('node:assert/strict');
const URL = (process.env.BASE || 'http://localhost:5173') + '/Schedule%20Demo.dc.html?solver=http://localhost:1';

(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1440, height: 900 } }), errs = [];
  p.on('pageerror', e => errs.push(e.message));
  const body = () => p.innerText('body'), btn = (name, exact) => p.getByRole('button', { name, exact });
  const step = async (name, fn) => { try { await fn(); console.log('ok  ', name); } catch (e) { console.log('FAIL', name, '\n     ', e.message.split('\n')[0]); process.exitCode = 1; } };
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.goto(URL); await p.waitForTimeout(3000);

  await step('an empty week shows the three choices', async () => {
    assert.match(await body(), /Week 42 has no schedule yet/);
    assert.equal(await btn(/Copy week 41/).count(), 0, 'no copy when last week is empty');
  });
  await step('an empty week has no warnings', async () => {
    assert.match(await body(), /Things to check\s*0/);
  });
  await step('a public holiday closes the preschool with one click', async () => {
    for (let i = 0; i < 10; i++) await btn('›').click();
    await btn('Make schedule', true).click(); await btn(/The preschool is closed/).click();
    await btn(/Christmas Day \(Fri w\.52\)/).click(); await p.waitForTimeout(200);
    assert.match(await body(), /Week 52 · Friday – Christmas Day: the preschool is closed all day/);
    await btn(/The preschool is closed/).click(); await p.waitForTimeout(200);
    assert.equal(await btn(/Christmas Day \(Fri/).count(), 0, 'not offered twice');
    await btn('Cancel', true).click(); await btn('Close', true).click();
    await btn(/^Friday/).click(); await p.waitForTimeout(200);
    assert.match(await body(), /★ Christmas Day: the preschool is closed all day/);
    await btn(/^Tuesday/).click();
    for (let i = 0; i < 10; i++) await btn('‹').click();
  });
  await step('dates are real dates', async () => {
    assert.match(await body(), /12–16 Oct 2026/);
    for (let i = 0; i < 3; i++) await btn('›').click();
    assert.match(await body(), /2–6 Nov 2026/);
    for (let i = 0; i < 7; i++) await btn('›').click();
    assert.match(await body(), /21–25 Dec 2026/);
    for (let i = 0; i < 10; i++) await btn('‹').click();
  });
  await step('Draw it myself hides the card for that week only', async () => {
    await btn('Draw it myself').click(); await p.waitForTimeout(300);
    assert.doesNotMatch(await body(), /has no schedule yet/);
    await btn('›').click(); await p.waitForTimeout(300);
    assert.match(await body(), /Week 43 has no schedule yet/);
    await btn('‹').click();
  });
  await step('a special day can be added and removed', async () => {
    await btn('Make schedule', true).click();
    await btn(/Staff hope to finish early/).click();
    await btn('Add', true).click(); await p.waitForTimeout(200);
    assert.doesNotMatch(await body(), /Week 42 · /, 'Add does nothing until a day is picked');
    await btn('Tue', true).click(); await btn('Add', true).click(); await p.waitForTimeout(200);
    assert.match(await body(), /Week 42 · Tuesday – staff hope to finish by 17:00/);
    await p.locator('button[title="×"]').first().click(); await p.waitForTimeout(200);
    assert.doesNotMatch(await body(), /Week 42 · Tuesday/);
  });
  await step('without the solver, the saved schedule is used and the report says so', async () => {
    await btn('2 weeks').click(); await btn(/Make schedule for weeks 42–43/).click();
    await p.waitForFunction(() => /This is how it turned out/.test(document.body.innerText), null, { timeout: 30000 });
    const t = await body();
    assert.match(t, /solver was not running/); assert.match(t, /WEEK 42/); assert.match(t, /WEEK 43/);
    assert.match(t, /Enough adults with the children all day, every day/);
  });
  await step('the schedule has no warnings and can be undone in one step', async () => {
    await btn('Good, close').click(); await p.waitForTimeout(300);
    assert.match(await body(), /Things to check\s*0/);
    await btn(/Undo/).first().click(); await p.waitForTimeout(300);
    assert.match(await body(), /Week 42 has no schedule yet|0 h \/ 612 h/);
    await btn(/Redo/).first().click(); await p.waitForTimeout(300);
  });
  await step('a break can be dragged anywhere in the day; other blocks stay put', async () => {
    const day = () => p.evaluate(() => JSON.parse(localStorage.getItem('schema-demo-v5')).s.shifts.filter(x => x.staff === 'p1' && x.week === 42 && x.day === 1).sort((a, b) => a.start - b.start).map(x => [x.type, x.start, x.end]));
    const before = await day(), brk = before.find(x => x[0] === 'break'), others = before.filter(x => x[0] !== 'contact' && x[0] !== 'break');
    const el = await p.evaluate(() => { const row = document.querySelector('[data-row="p1"]'); for (const e of row.querySelectorAll('[data-track] > div')) if (getComputedStyle(e).backgroundColor === 'rgb(255, 218, 216)') { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; } });
    await p.mouse.move(el.x, el.y); await p.mouse.down(); for (let i = 1; i <= 20; i++) await p.mouse.move(el.x + i * 12, el.y); await p.mouse.up(); await p.waitForTimeout(300);
    const after = await day(), moved = after.find(x => x[0] === 'break');
    assert.ok(moved[1] - brk[1] >= 120, 'the break moved well past its old neighbours: ' + JSON.stringify(after));
    assert.deepEqual(after.filter(x => x[0] !== 'contact' && x[0] !== 'break'), others, 'planning stays put');
    const sum = d => d.reduce((a, x) => ({ ...a, [x[0]]: (a[x[0]] || 0) + x[2] - x[1] }), {});
    assert.deepEqual(sum(after), sum(before)); assert.equal(after[0][1], before[0][1]); assert.equal(after.at(-1)[2], before.at(-1)[2]);
    await btn(/Undo/).first().click(); await p.waitForTimeout(300);
    assert.deepEqual(await day(), before, 'undo puts it back');
  });
  await step('a week with shifts offers to keep them and fill in around them', async () => {
    await btn('Make schedule', true).click(); await p.waitForTimeout(200);
    const t = await body();
    assert.match(t, /Week 42 already has shifts for 18 people/);
    assert.match(t, /Keep them and fill in around them/); assert.match(t, /Start over: replace the whole week/);
    await btn('Close', true).click();
  });
  await step('Copy last week appears once the week before has a schedule', async () => {
    for (let i = 0; i < 2; i++) await btn('›').click(); await p.waitForTimeout(300);
    await btn(/Copy week 43/).click(); await p.waitForTimeout(300);
    assert.doesNotMatch(await body(), /has no schedule yet/);
    for (let i = 0; i < 2; i++) await btn('‹').click();
  });
  await step("the phone opens on the scheduled week, with today's Sick button", async () => {
    // Only week 42 is scheduled while the real date is later (as when trying the demo): week 42 plays "this week".
    await p.evaluate(() => { const j = JSON.parse(localStorage.getItem('schema-demo-v5')); j.s.shifts = j.s.shifts.filter(x => x.week === 42); localStorage.setItem('schema-demo-v5', JSON.stringify(j)); });
    await p.goto(URL); await p.waitForTimeout(3000);
    await btn("Staff's phone", true).click(); await p.waitForTimeout(1000);
    try {
      assert.equal(await p.getByText('Week 42', { exact: true }).count(), 1, 'opens on week 42, not an empty week');
      assert.equal(await btn('Sick', true).count(), 1, 'today is not treated as past');
    } finally { await btn('Close', true).click(); }
  });
  await step('the demo runs on week 42', async () => {
    await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.goto(URL); await p.waitForTimeout(3000);
    await btn('▶ Demo').click(); await p.waitForTimeout(3000);
    assert.match(await body(), /Her shift today is \d\d:\d\d–\d\d:\d\d in /);
    await p.waitForTimeout(3000);
    assert.match(await body(), /In progress \(1\)/, 'the free shift shows up');
    await btn(/Stop|Done/).click();
  });
  await step('Swedish', async () => {
    await btn('SV', true).click(); await btn('Skapa schema', true).click(); await p.waitForTimeout(300);
    const t = await body();
    assert.match(t, /Vilka veckor\?/); assert.match(t, /eller upp till 2 timmar till om nästa vecka är lika mycket kortare/);
  });
  assert.deepEqual(errs, []);
  await b.close();
})();
