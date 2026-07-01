const { decodeQR } = require('./qr');
const { parseRollNumber } = require('./parser');
const { saveAttendance, getReport } = require('./attendance');
async function main() {
    const args = process.argv.slice(2);
    const mode = args[0];
    if (mode === '/report') {
        const report = getReport();
        console.log(`\n=== ATTENDANCE REPORT ===`);
        console.log(`Total Students Present: ${report.total}`);
        console.log(`Registered Roll Numbers:`, report.students.join(', ') || 'None');
        return;
    }
    if (!mode) {
        console.log("Usage:\n  node index.js <image_name.jpg>  (To scan an ID card)\n  node index.js /report          (To view stats)");
        return;
    }
    try {
        console.log(`Processing scan for image: ${mode}...`);
        const rawText = await decodeQR(mode);
        const rollNumber = parseRollNumber(rawText);
        const totalCount = saveAttendance(rollNumber);
        console.log(`\n✅ SUCCESS: Roll number ${rollNumber} marked Present!`);
        console.log(`Total active logs: ${totalCount}`);
    } catch (error) {
        console.error(`\n❌ ERROR: ${error.message}`);
    }
}
main();