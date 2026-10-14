import fs from 'node:fs';
import postcss from 'postcss';
const target = new URL('../src/components/RotatedMobile.css', import.meta.url);
const existing = fs.readFileSync(target, 'utf8');
let output = existing.slice(0, existing.indexOf('@media'));
for (const name of ['MobileGameLayout.css', 'AttendanceViewport.css']) {
  const root = postcss.parse(fs.readFileSync(new URL('../src/components/' + name, import.meta.url), 'utf8'));
  root.walkAtRules('media', rule => {
    if (!/orientation\s*:\s*landscape/.test(rule.params)) return;
    const copy = rule.clone();
    copy.params = copy.params.replace(/orientation\s*:\s*landscape/g, 'orientation:portrait')
      .replace(/\b(width|height)\b/g, axis => axis === 'width' ? 'height' : 'width');
    copy.walkRules(child => {
      child.selectors = child.selectors.map(selector => /^html\b/.test(selector)
        ? selector.replace(/^html/, 'html.mobile-rotated') : 'html.mobile-rotated ' + selector);
    });
    output += copy.toString() + '\n';
  });
}
output += existing.slice(existing.indexOf('/* ROTATED_FINAL */'));
fs.writeFileSync(target, output);
