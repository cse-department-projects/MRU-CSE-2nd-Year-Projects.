const fs = require('fs');

let content = fs.readFileSync('src/data/coursesData.ts', 'utf8');

const newRoadmapNodes = `export const ROADMAP_NODES: RoadmapNode[] = [
  {
    id: 'node-1',
    title: 'Beginner: Syntax & Control Flow',
    description: 'Master C/C++ fundamentals, variables, loops, and basic memory concepts.',
    estimatedHours: 4,
    xpReward: 200,
    starsReward: 10,
    status: 'in_progress',
    modules: [
      { id: 'm1-1', title: 'Data Types, Pointers & References', duration: '45 min', completed: false },
      { id: 'm1-2', title: 'Control Flow & Functions', duration: '60 min', completed: false },
      { id: 'm1-3', title: 'Memory Basics (Stack vs Heap)', duration: '75 min', completed: false }
    ]
  },
  {
    id: 'node-2',
    title: 'Intermediate: OOP & Data Structures',
    description: 'Object-Oriented Programming in C++, Classes, Structs, Arrays, and Strings.',
    estimatedHours: 6,
    xpReward: 300,
    starsReward: 15,
    status: 'locked',
    modules: [
      { id: 'm2-1', title: 'Classes, Objects, and Access Modifiers', duration: '50 min', completed: false },
      { id: 'm2-2', title: 'Dynamic Memory Allocation (malloc, new)', duration: '90 min', completed: false },
      { id: 'm2-3', title: 'Arrays, Strings, and Iterators', duration: '80 min', completed: false }
    ]
  },
  {
    id: 'node-3',
    title: 'Advanced: STL & Templates',
    description: 'Mastering the Standard Template Library, Generic Programming, and Auto.',
    estimatedHours: 8.5,
    xpReward: 450,
    starsReward: 25,
    status: 'locked',
    modules: [
      { id: 'm3-1', title: 'Template Metaprogramming Basics', duration: '90 min', completed: false },
      { id: 'm3-2', title: 'Vectors, Maps, Sets, and Algorithms', duration: '120 min', completed: false },
      { id: 'm3-3', title: 'Smart Pointers (unique_ptr, shared_ptr)', duration: '110 min', completed: false }
    ]
  },
  {
    id: 'node-4',
    title: 'Expert: Modern C++ (C++11/14/17/20)',
    description: 'Lambda expressions, move semantics, constexpr, and multithreading.',
    estimatedHours: 10,
    xpReward: 600,
    starsReward: 30,
    status: 'locked',
    modules: [
      { id: 'm4-1', title: 'L-values, R-values, and Move Semantics', duration: '60 min', completed: false },
      { id: 'm4-2', title: 'Lambda Expressions and Functional C++', duration: '90 min', completed: false },
      { id: 'm4-3', title: 'Concurrency, Threads, and Mutexes', duration: '120 min', completed: false }
    ]
  }
];`;

const newResources = `export const RESOURCE_ITEMS: ResourceItem[] = [
  {
    id: 'res-1',
    title: 'C Programming for Beginners - Master the C Language',
    type: 'video',
    topic: 'Beginner',
    difficulty: 'Foundational',
    duration: '3 hrs 45 min',
    rating: 4.9,
    url: 'https://www.youtube.com/watch?v=KJgsSFOSQv0'
  },
  {
    id: 'res-2',
    title: 'The C Programming Language (K&R) - Official Guide',
    type: 'pdf',
    topic: 'Beginner',
    difficulty: 'Intermediate',
    duration: '274 pages',
    rating: 5.0,
    url: 'https://archive.org/details/TheCProgrammingLanguageFirstEdition'
  },
  {
    id: 'res-3',
    title: 'C++ Tutorial for Beginners - Full Course',
    type: 'video',
    topic: 'Intermediate',
    difficulty: 'Foundational',
    duration: '4 hrs',
    rating: 4.8,
    url: 'https://www.youtube.com/watch?v=vLnPwxZdW4Y'
  },
  {
    id: 'res-4',
    title: 'Effective C++: 55 Specific Ways to Improve Your Programs',
    type: 'pdf',
    topic: 'Advanced',
    difficulty: 'Hard',
    duration: '320 pages',
    rating: 4.95,
    url: 'https://www.oreilly.com/library/view/effective-c-55/0321334876/'
  },
  {
    id: 'res-5',
    title: 'Pointers and Memory Allocation in C/C++',
    type: 'video',
    topic: 'Intermediate',
    difficulty: 'Medium',
    duration: '1 hr 20 min',
    rating: 4.85,
    url: 'https://www.youtube.com/watch?v=zuegQmMdy8M'
  },
  {
    id: 'res-6',
    title: 'Back to Basics: Smart Pointers in Modern C++',
    type: 'video',
    topic: 'Advanced',
    difficulty: 'Expert',
    duration: '1 hr',
    rating: 5.0,
    url: 'https://www.youtube.com/watch?v=UOBXtcQ7kE0'
  },
  {
    id: 'res-7',
    title: 'C++11/14/17/20 Features Summary Cheat Sheet',
    type: 'pdf',
    topic: 'Expert',
    difficulty: 'Expert',
    duration: '15 min read',
    rating: 4.9,
    url: 'https://github.com/AnthonyCalandra/modern-cpp-features'
  },
  {
    id: 'res-8',
    title: 'Interactive C++ Sandbox & Challenges',
    type: 'code',
    topic: 'All Levels',
    difficulty: 'Foundational',
    duration: 'Flexible',
    rating: 4.7,
    url: 'https://godbolt.org/'
  }
];`;

content = content.replace(/export const ROADMAP_NODES: RoadmapNode\[\] = \[[\s\S]*?\];/, newRoadmapNodes);
content = content.replace(/export const RESOURCE_ITEMS: ResourceItem\[\] = \[[\s\S]*?\];/, newResources);

fs.writeFileSync('src/data/coursesData.ts', content);
