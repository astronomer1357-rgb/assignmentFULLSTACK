function parseRollNumber(rawText) {
    const parts = rawText.split(',');
    const firstPart = parts[0];
    const rollString = firstPart.replace('02.', '');
    const rollNumber = parseInt(rollString, 10);
    if (isNaN(rollNumber) || rollString.length !== 6) {
        throw new Error(`Invalid roll number format extracted: ${rollString}`);
    }
    if (rollNumber < 240001 || rollNumber > 240400) {
        throw new Error(`Access Denied: Roll number ${rollNumber} is outside the allowed range (240001-240400).`);
    }
    return rollNumber;
}
module.exports = { parseRollNumber };