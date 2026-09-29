const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

process.env.TZ = 'UTC';

const FIXED_NOW = '2026-09-29T18:00:00.000Z';

function loadCalculator(fileName, values = {}) {
    const html = fs.readFileSync(path.join(__dirname, '..', fileName), 'utf8');
    const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
    const calculatorScript = scripts.map(match => match[1]).find(script => script.includes('function calculateDays'));
    assert.ok(calculatorScript, `calculateDays script not found in ${fileName}`);

    const elements = {};
    const element = id => {
        if (!elements[id]) {
            elements[id] = {
                value: values[id] || '',
                style: {},
                textContent: '',
                children: [],
                appendChild(child) {
                    this.children.push(child);
                }
            };
        }
        return elements[id];
    };

    const NativeDate = Date;
    class FixedDate extends NativeDate {
        constructor(...args) {
            super(...(args.length ? args : [FIXED_NOW]));
        }

        static now() {
            return new NativeDate(FIXED_NOW).getTime();
        }
    }

    const context = vm.createContext({
        Date: FixedDate,
        document: {
            getElementById: element,
            createElement: () => ({ innerHTML: '' })
        }
    });

    vm.runInContext(calculatorScript, context, { filename: fileName });
    vm.runInContext('calculateDays()', context);
    return elements;
}

function usResults(fileName, input, approvalDate = '') {
    const elements = loadCalculator(fileName, { input, approvalDate });
    return {
        total: elements.result.textContent,
        before: elements.beforeApprovalResult.textContent,
        after: elements.afterApprovalResult.textContent
    };
}

for (const fileName of ['index.html', 'mx.html']) {
    const closed = usResults(fileName, '1 2024-01-10 Departure 840\n2 2024-01-01 Arrival BLA');
    assert.match(closed.total, /10$/);

    const today = usResults(fileName, '1 2026-09-29 Arrival BLA');
    assert.match(today.total, /1$/);

    const yesterday = usResults(fileName, '1 2026-09-28 Arrival BLA');
    assert.match(yesterday.total, /2$/);

    const split = usResults(fileName, '1 2026-09-20 Arrival BLA', '2026-09-24');
    assert.match(split.total, /10$/);
    assert.match(split.before, /4$/);
    assert.match(split.after, /6$/);
}

const canadaOpen = loadCalculator('CanadaDaysByI94.html', {
    input: '1 2026-09-20 Departure 840',
    approvalDate: '2026-09-24',
    excludedDates: ''
});
assert.match(canadaOpen.result.textContent, /10$/);
assert.match(canadaOpen.beforeApprovalResult.textContent, /4$/);
assert.match(canadaOpen.afterApprovalResult.textContent, /6$/);

const canadaExcluded = loadCalculator('CanadaDaysByI94.html', {
    input: '1 2026-09-20 Departure 840',
    approvalDate: '2026-09-24',
    excludedDates: '2026-09-22 2026-09-23'
});
assert.match(canadaExcluded.result.textContent, /8$/);
assert.match(canadaExcluded.beforeApprovalResult.textContent, /2$/);
assert.match(canadaExcluded.afterApprovalResult.textContent, /6$/);

console.log('All date calculation tests passed.');
