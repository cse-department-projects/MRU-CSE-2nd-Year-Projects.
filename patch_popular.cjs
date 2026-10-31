const fs = require('fs');
let content = fs.readFileSync('src/data/coursesData.ts', 'utf8');

const newCourses = `export const POPULAR_COURSES: CourseItem[] = [
  {
    id: 'course-1',
    category: 'C Programming',
    iconType: 'laptop',
    rating: 4.9,
    title: 'Advanced C: Pointers, Memory & Data Structures',
    studentCount: '15,200 students',
    pastelBg: 'peach',
    duration: '12.5 hrs',
    level: 'Advanced',
    lessons: 48,
    instructor: 'Alex Developer'
  },
  {
    id: 'course-2',
    category: 'C++ Modern',
    iconType: 'sparkles',
    rating: 4.8,
    title: 'Modern C++ Bootcamp (C++11 to C++20)',
    studentCount: '8,400 students',
    pastelBg: 'blue',
    duration: '22 hrs',
    level: 'Intermediate',
    lessons: 85,
    instructor: 'Sarah Architect'
  },
  {
    id: 'course-3',
    category: 'Algorithms',
    iconType: 'cube',
    rating: 5.0,
    title: 'Competitive Programming with C++',
    studentCount: '4,100 students',
    pastelBg: 'green',
    duration: '35 hrs',
    level: 'Expert',
    lessons: 112,
    instructor: 'Code Master'
  },
  {
    id: 'course-4',
    category: 'C Fundamentals',
    iconType: 'briefcase',
    rating: 4.7,
    title: 'C Programming for Absolute Beginners',
    studentCount: '25,000 students',
    pastelBg: 'yellow',
    duration: '8 hrs',
    level: 'Beginner',
    lessons: 32,
    instructor: 'Jane Doe'
  }
];`;

content = content.replace(/export const POPULAR_COURSES: CourseItem\[\] = \[[\s\S]*?\];/, newCourses);
fs.writeFileSync('src/data/coursesData.ts', content);
