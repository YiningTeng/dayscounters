const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// The timestamp intentionally has no timezone suffix so every test process sees
// the same local calendar date, regardless of its TZ environment variable.
const FIXED_NOW = '2026-09-29T18:00:00.000';

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

function assertUsResult(fileName, input, expected, approvalDate = '') {
    const result = usResults(fileName, input, approvalDate);
    assert.match(result.total, new RegExp(`${expected.total}$`), `${fileName}: total`);
    if (expected.before !== undefined) {
        assert.match(result.before, new RegExp(`${expected.before}$`), `${fileName}: before approval`);
        assert.match(result.after, new RegExp(`${expected.after}$`), `${fileName}: after approval`);
        assert.equal(expected.before + expected.after, expected.total, `${fileName}: approval split must equal total`);
    }
}

const usCases = [
    {
        name: 'same-day closed trip',
        input: '1 2024-01-01 Arrival BLA\n2 2024-01-01 Departure 840',
        expected: { total: 1 }
    },
    {
        name: 'same-month closed trip',
        input: '1 2024-01-10 Departure 840\n2 2024-01-01 Arrival BLA',
        expected: { total: 10 }
    },
    {
        name: 'cross-month closed trip',
        input: '1 2024-02-01 Departure 840\n2 2024-01-31 Arrival BLA',
        expected: { total: 2 }
    },
    {
        name: 'leap-day closed trip',
        input: '1 2024-02-29 Departure 840\n2 2024-02-28 Arrival BLA',
        expected: { total: 2 }
    },
    {
        name: 'cross-year closed trip',
        input: '1 2025-01-01 Departure 840\n2 2024-12-31 Arrival BLA',
        expected: { total: 2 }
    },
    {
        name: 'multiple closed trips',
        input: '1 2024-01-12 Departure 840\n2 2024-01-10 Arrival BLA\n3 2024-01-03 Departure 840\n4 2024-01-01 Arrival BLA',
        expected: { total: 6 }
    },
    {
        name: 'ascending input order',
        input: '1 2024-01-01 Arrival BLA\n2 2024-01-10 Departure 840',
        expected: { total: 10 }
    },
    {
        name: 'approval in closed trip',
        input: '1 2024-01-10 Departure 840\n2 2024-01-01 Arrival BLA',
        approvalDate: '2024-01-05',
        expected: { total: 10, before: 4, after: 6 }
    },
    {
        name: 'approval equals arrival',
        input: '1 2024-01-10 Departure 840\n2 2024-01-01 Arrival BLA',
        approvalDate: '2024-01-01',
        expected: { total: 10, before: 0, after: 10 }
    },
    {
        name: 'approval equals departure',
        input: '1 2024-01-10 Departure 840\n2 2024-01-01 Arrival BLA',
        approvalDate: '2024-01-10',
        expected: { total: 10, before: 9, after: 1 }
    },
    {
        name: 'approval before closed trip',
        input: '1 2024-01-10 Departure 840\n2 2024-01-01 Arrival BLA',
        approvalDate: '2023-12-31',
        expected: { total: 10, before: 0, after: 10 }
    },
    {
        name: 'approval after closed trip',
        input: '1 2024-01-10 Departure 840\n2 2024-01-01 Arrival BLA',
        approvalDate: '2024-01-11',
        expected: { total: 10, before: 10, after: 0 }
    },
    {
        name: 'open trip starting today',
        input: '1 2026-09-29 Arrival BLA',
        expected: { total: 1 }
    },
    {
        name: 'open trip starting yesterday',
        input: '1 2026-09-28 Arrival BLA',
        expected: { total: 2 }
    },
    {
        name: 'approval in open trip',
        input: '1 2026-09-20 Arrival BLA',
        approvalDate: '2026-09-24',
        expected: { total: 10, before: 4, after: 6 }
    },
    {
        name: 'approval before open trip',
        input: '1 2026-09-20 Arrival BLA',
        approvalDate: '2026-09-19',
        expected: { total: 10, before: 0, after: 10 }
    },
    {
        name: 'approval after open trip',
        input: '1 2026-09-20 Arrival BLA',
        approvalDate: '2026-09-30',
        expected: { total: 10, before: 10, after: 0 }
    }
];

for (const fileName of ['index.html', 'mx.html']) {
    for (const testCase of usCases) {
        assertUsResult(fileName, testCase.input, testCase.expected, testCase.approvalDate);
    }
}

function assertCanadaResult(values, expected, name) {
    const elements = loadCalculator('CanadaDaysByI94.html', values);
    assert.match(elements.result.textContent, new RegExp(`${expected.total}$`), `${name}: total`);
    if (expected.before !== undefined) {
        assert.match(elements.beforeApprovalResult.textContent, new RegExp(`${expected.before}$`), `${name}: before approval`);
        assert.match(elements.afterApprovalResult.textContent, new RegExp(`${expected.after}$`), `${name}: after approval`);
        assert.equal(expected.before + expected.after, expected.total, `${name}: approval split must equal total`);
    }
}

const canadaCases = [
    {
        name: 'closed Canada period',
        values: { input: '1 2026-09-29 Arrival 840\n2 2026-09-20 Departure BLA' },
        expected: { total: 10 }
    },
    {
        name: 'open Canada period starting today',
        values: { input: '1 2026-09-29 Departure 840' },
        expected: { total: 1 }
    },
    {
        name: 'open Canada period starting yesterday',
        values: { input: '1 2026-09-28 Departure 840' },
        expected: { total: 2 }
    },
    {
        name: 'approval in open Canada period',
        values: { input: '1 2026-09-20 Departure 840', approvalDate: '2026-09-24' },
        expected: { total: 10, before: 4, after: 6 }
    },
    {
        name: 'excluded days before approval',
        values: {
            input: '1 2026-09-20 Departure 840',
            approvalDate: '2026-09-24',
            excludedDates: '2026-09-22 2026-09-23'
        },
        expected: { total: 8, before: 2, after: 6 }
    },
    {
        name: 'excluded days after approval',
        values: {
            input: '1 2026-09-20 Departure 840',
            approvalDate: '2026-09-24',
            excludedDates: '2026-09-25 2026-09-26'
        },
        expected: { total: 8, before: 4, after: 4 }
    },
    {
        name: 'excluded period outside trip',
        values: {
            input: '1 2026-09-20 Departure 840',
            approvalDate: '2026-09-24',
            excludedDates: '2026-09-01 2026-09-05'
        },
        expected: { total: 10, before: 4, after: 6 }
    },
    {
        name: 'excluded day on approval date',
        values: {
            input: '1 2026-09-20 Departure 840',
            approvalDate: '2026-09-24',
            excludedDates: '2026-09-24 2026-09-24'
        },
        expected: { total: 9, before: 4, after: 5 }
    }
];

for (const testCase of canadaCases) {
    assertCanadaResult(testCase.values, testCase.expected, testCase.name);
}

console.log(`All 42 date calculation scenarios passed in ${process.env.TZ || 'system timezone'}.`);
