class Student {
    constructor(name, marks) {
        this.name = name;
        this.marks = marks;
    }
    calculateAverage() {
        let total = 0;
        for (let i = 0; i < this.marks.length; i++) {
            total += this.marks[i];
        }
        let average = total / this.marks.length;
        return average;
    }
}
let inputName = process.argv[2];
let inputMarks = process.argv.slice(3).map(Number);

if (!inputName || inputMarks.length === 0) {
    console.log("Error: Please provide a student name and exam scores.");
    console.log('Example use: node reportCard.js "Sanjay" 85 90 78');
    process.exit(1); 
}
let currentStudent = new Student(inputName, inputMarks);
let finalAverage = currentStudent.calculateAverage();
let status = finalAverage >= 50 ? "PASSED" : "FAILED";
console.log("\n========================================");
console.log("           STUDENT REPORT CARD          ");
console.log("========================================");
console.log(` Student Name : ${currentStudent.name}`);
console.log(` Exam Scores  : ${currentStudent.marks.join(", ")}`);
console.log("----------------------------------------");
console.log(` Final Average: ${finalAverage.toFixed(2)}%`);
console.log(` Status       : ${status}`);
console.log("========================================\n");