
const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');

function checkBrackets(str) {
    const stack = [];
    const brackets = {
        '(': ')',
        '[': ']',
        '{': '}'
    };
    const lines = str.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (brackets[char]) {
                stack.push({ char, line: i + 1, col: j + 1 });
            } else if (Object.values(brackets).includes(char)) {
                if (stack.length === 0) {
                    console.log(`Unmatched closing bracket ${char} at line ${i + 1}, col ${j + 1}`);
                } else {
                    const last = stack.pop();
                    if (brackets[last.char] !== char) {
                        console.log(`Mismatched bracket ${char} at line ${i + 1}, col ${j + 1}. Expected ${brackets[last.char]} (opened at line ${last.line}, col ${last.col})`);
                    }
                }
            }
        }
    }
    while (stack.length > 0) {
        const last = stack.pop();
        console.log(`Unclosed bracket ${last.char} opened at line ${last.line}, col ${last.col}`);
    }
}

checkBrackets(content);
