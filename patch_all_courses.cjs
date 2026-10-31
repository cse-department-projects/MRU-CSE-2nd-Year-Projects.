const fs = require('fs');
let content = fs.readFileSync('src/data/coursesData.ts', 'utf8');

const newCourses = `export const POPULAR_COURSES: CourseItem[] = [
  {
    id: 'course-1',
    category: 'Web Development',
    iconType: 'laptop',
    rating: 4.9,
    title: 'Full-Stack React, Next.js & TypeScript',
    studentCount: '45,200 students',
    pastelBg: 'blue',
    duration: '42.5 hrs',
    level: 'Intermediate',
    lessons: 128,
    instructor: 'Web Master'
  },
  {
    id: 'course-2',
    category: 'Python',
    iconType: 'sparkles',
    rating: 4.8,
    title: 'Python for Automation & Data Science',
    studentCount: '82,400 students',
    pastelBg: 'green',
    duration: '22 hrs',
    level: 'Beginner',
    lessons: 85,
    instructor: 'Dr. Py'
  },
  {
    id: 'course-3',
    category: 'Algorithms',
    iconType: 'cube',
    rating: 5.0,
    title: 'DSA: Cracking the Coding Interview',
    studentCount: '104,100 students',
    pastelBg: 'peach',
    duration: '35 hrs',
    level: 'Expert',
    lessons: 112,
    instructor: 'Algo Expert'
  },
  {
    id: 'course-4',
    category: 'Java',
    iconType: 'briefcase',
    rating: 4.7,
    title: 'Mastering Java & Spring Boot Architecture',
    studentCount: '35,000 students',
    pastelBg: 'yellow',
    duration: '28 hrs',
    level: 'Advanced',
    lessons: 92,
    instructor: 'Java Guru'
  }
];`;

const newRoadmapNodes = `export const ROADMAP_NODES: RoadmapNode[] = [
  {
    id: 'node-1',
    title: 'Phase 1: Programming Foundations',
    description: 'Master core concepts using Python and Java. Variables, loops, OOP, and memory.',
    estimatedHours: 15,
    xpReward: 300,
    starsReward: 10,
    status: 'in_progress',
    modules: [
      { id: 'm1-1', title: 'Python Basics & Control Flow', duration: '3 hrs', completed: false },
      { id: 'm1-2', title: 'Object-Oriented Programming in Java', duration: '5 hrs', completed: false },
      { id: 'm1-3', title: 'Memory, Pointers & References', duration: '2 hrs', completed: false }
    ]
  },
  {
    id: 'node-2',
    title: 'Phase 2: Web Fundamentals (HTML, CSS, JS)',
    description: 'Build responsive layouts and add interactivity with modern JavaScript (ES6+).',
    estimatedHours: 20,
    xpReward: 400,
    starsReward: 15,
    status: 'locked',
    modules: [
      { id: 'm2-1', title: 'Semantic HTML & CSS Flexbox/Grid', duration: '4 hrs', completed: false },
      { id: 'm2-2', title: 'JavaScript DOM Manipulation', duration: '6 hrs', completed: false },
      { id: 'm2-3', title: 'Async JS, Promises & APIs', duration: '5 hrs', completed: false }
    ]
  },
  {
    id: 'node-3',
    title: 'Phase 3: React & TypeScript',
    description: 'Build scalable, type-safe frontend applications with React hooks and TS.',
    estimatedHours: 25,
    xpReward: 600,
    starsReward: 25,
    status: 'locked',
    modules: [
      { id: 'm3-1', title: 'TypeScript Fundamentals', duration: '4 hrs', completed: false },
      { id: 'm3-2', title: 'React Hooks & State Management', duration: '8 hrs', completed: false },
      { id: 'm3-3', title: 'Next.js Routing & Server Components', duration: '6 hrs', completed: false }
    ]
  },
  {
    id: 'node-4',
    title: 'Phase 4: Data Structures & Algorithms',
    description: 'Master graphs, dynamic programming, trees, and system design for interviews.',
    estimatedHours: 30,
    xpReward: 800,
    starsReward: 30,
    status: 'locked',
    modules: [
      { id: 'm4-1', title: 'Arrays, Hashmaps & Two Pointers', duration: '5 hrs', completed: false },
      { id: 'm4-2', title: 'Trees, Graphs & BFS/DFS', duration: '8 hrs', completed: false },
      { id: 'm4-3', title: 'Dynamic Programming & System Design', duration: '10 hrs', completed: false }
    ]
  }
];`;

const newResources = `export const RESOURCE_ITEMS: ResourceItem[] = [
  {
    id: 'res-1',
    title: 'Automate the Boring Stuff with Python',
    type: 'pdf',
    topic: 'Python',
    difficulty: 'Beginner',
    duration: '500 pages',
    rating: 4.9,
    url: 'https://automatetheboringstuff.com/'
  },
  {
    id: 'res-2',
    title: 'Python for Beginners - Full Course',
    type: 'video',
    topic: 'Python',
    difficulty: 'Beginner',
    duration: '4 hrs',
    rating: 4.8,
    url: 'https://www.youtube.com/watch?v=rfscVS0vtbw'
  },
  {
    id: 'res-3',
    title: 'Java Programming MOOC (University of Helsinki)',
    type: 'code',
    topic: 'Java',
    difficulty: 'Foundational',
    duration: '14 Parts',
    rating: 5.0,
    url: 'https://java-programming.mooc.fi/'
  },
  {
    id: 'res-4',
    title: 'Java Full Course - Master Java Basics',
    type: 'video',
    topic: 'Java',
    difficulty: 'Intermediate',
    duration: '12 hrs',
    rating: 4.8,
    url: 'https://www.youtube.com/watch?v=xk4_1vDrzzo'
  },
  {
    id: 'res-5',
    title: 'MDN Web Docs: HTML & CSS',
    type: 'notes',
    topic: 'HTML/CSS',
    difficulty: 'Beginner',
    duration: 'Comprehensive',
    rating: 4.9,
    url: 'https://developer.mozilla.org/en-US/docs/Learn'
  },
  {
    id: 'res-6',
    title: 'CSS Flexbox Zombies (Interactive Game)',
    type: 'code',
    topic: 'CSS',
    difficulty: 'Intermediate',
    duration: '3 hrs',
    rating: 5.0,
    url: 'https://mastery.games/flexboxzombies/'
  },
  {
    id: 'res-7',
    title: 'Eloquent JavaScript - Modern JS Guide',
    type: 'pdf',
    topic: 'JavaScript',
    difficulty: 'Intermediate',
    duration: '400 pages',
    rating: 4.9,
    url: 'https://eloquentjavascript.net/'
  },
  {
    id: 'res-8',
    title: 'The Modern JavaScript Tutorial',
    type: 'notes',
    topic: 'JavaScript',
    difficulty: 'Advanced',
    duration: 'Comprehensive',
    rating: 4.95,
    url: 'https://javascript.info/'
  },
  {
    id: 'res-9',
    title: 'TypeScript Handbook & Official Docs',
    type: 'notes',
    topic: 'TypeScript',
    difficulty: 'Intermediate',
    duration: 'Comprehensive',
    rating: 4.9,
    url: 'https://www.typescriptlang.org/docs/'
  },
  {
    id: 'res-10',
    title: 'Total TypeScript - Matt Pocock (Beginner to Expert)',
    type: 'video',
    topic: 'TypeScript',
    difficulty: 'Expert',
    duration: '10 hrs',
    rating: 5.0,
    url: 'https://www.youtube.com/@mattpocockuk'
  },
  {
    id: 'res-11',
    title: 'React.dev - Official Learn React Docs',
    type: 'notes',
    topic: 'React',
    difficulty: 'Intermediate',
    duration: 'Comprehensive',
    rating: 4.9,
    url: 'https://react.dev/learn'
  },
  {
    id: 'res-12',
    title: 'Full React Course (FreeCodeCamp)',
    type: 'video',
    topic: 'React',
    difficulty: 'Beginner',
    duration: '12 hrs',
    rating: 4.8,
    url: 'https://www.youtube.com/watch?v=bMknfKXIFA8'
  },
  {
    id: 'res-13',
    title: 'NeetCode - DSA Patterns & Roadmap',
    type: 'code',
    topic: 'DSA',
    difficulty: 'Advanced',
    duration: '150 Problems',
    rating: 5.0,
    url: 'https://neetcode.io/roadmap'
  },
  {
    id: 'res-14',
    title: 'Grokking Algorithms (Visual Book)',
    type: 'pdf',
    topic: 'DSA',
    difficulty: 'Foundational',
    duration: '256 pages',
    rating: 4.9,
    url: 'https://www.manning.com/books/grokking-algorithms-second-edition'
  }
];`;

content = content.replace(/export const POPULAR_COURSES: CourseItem\[\] = \[[\s\S]*?\];/, newCourses);
content = content.replace(/export const ROADMAP_NODES: RoadmapNode\[\] = \[[\s\S]*?\];/, newRoadmapNodes);
content = content.replace(/export const RESOURCE_ITEMS: ResourceItem\[\] = \[[\s\S]*?\];/, newResources);

fs.writeFileSync('src/data/coursesData.ts', content);
