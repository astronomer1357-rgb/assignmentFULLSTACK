const fs = require('fs');
const path = require('path');
const FILE_PATH = path.join(__dirname, 'attendance.json');
function saveAttendance(rollNumber) {
    let attendanceLog = {};
    if (fs.existsSync(FILE_PATH)) {
        const rawData = fs.readFileSync(FILE_PATH, 'utf8');
        attendanceLog = JSON.parse(rawData || '{}');
    }
    if (attendanceLog[rollNumber]) {
        throw new Error(`Roll number ${rollNumber} has already been marked present.`);
    }
    attendanceLog[rollNumber] = {
        status: "Present",
        timestamp: new Date().toISOString()
    };
    fs.writeFileSync(FILE_PATH, JSON.stringify(attendanceLog, null, 2), 'utf8');
    return Object.keys(attendanceLog).length;
}

function getReport() {
    if (!fs.existsSync(FILE_PATH)) {
        return { total: 0, students: [] };
    }
    const rawData = fs.readFileSync(FILE_PATH, 'utf8');
    const attendanceLog = JSON.parse(rawData || '{}');
    const students = Object.keys(attendanceLog).map(Number);
    return {
        total: students.length,
        students: students
    };
}
module.exports = { saveAttendance, getReport };