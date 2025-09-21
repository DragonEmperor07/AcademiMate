
let students = [
  { name: 'Liam Johnson', id: 'S001', password: 'password', status: 'Absent' },
  { name: 'Olivia Smith', id: 'S002', password: 'password', status: 'Absent' },
  { name: 'Noah Williams', id: 'S003', password: 'password', status: 'Absent' },
  { name: 'Emma Brown', id: 'S004', password: 'password', status: 'Absent' },
  { name: 'Oliver Jones', id: 'S005', password: 'password', status: 'Absent' },
  { name: 'Ava Garcia', id: 'S006', password: 'password', status: 'Absent' },
  { name: 'Elijah Miller', id: 'S007', password: 'password', status: 'Absent' },
  { name: 'Charlotte Davis', id: 'S008', password: 'password', status: 'Absent' },
  { name: 'James Rodriguez', id: 'S009', password: 'password', status: 'Absent' },
  { name: 'Jane Doe', id: 'S010', password: 'password', status: 'Absent' },
];

let listeners: (() => void)[] = [];

function notifyListeners() {
  listeners.forEach(listener => listener());
}

export function subscribe(callback: () => void) {
  listeners.push(callback);
  return function unsubscribe() {
    listeners = listeners.filter(l => l !== callback);
  };
}

export function getStudents() {
    return students;
}

export function validateStudent(studentId: string, password_param: string) {
  const student = students.find(s => s.id === studentId);
  if (!student) {
    return false;
  }
  return student.password === password_param;
}

export function getStudentById(studentId: string) {
  return students.find(s => s.id === studentId) || null;
}

export function updateStudentStatus(studentId: string, newStatus: 'Present' | 'Absent') {
  students = students.map(student => 
    student.id === studentId ? { ...student, status: newStatus } : student
  );
  notifyListeners();
}

export function addStudent(student: {name: string, id: string, status: 'Present' | 'Absent', password: string}) {
    students.push(student);
    notifyListeners();
}

export function resetAllStudentStatuses() {
    students = students.map(student => ({ ...student, status: 'Absent' }));
    notifyListeners();
}