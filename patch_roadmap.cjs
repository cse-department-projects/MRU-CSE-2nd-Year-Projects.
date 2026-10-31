const fs = require('fs');
let content = fs.readFileSync('src/data/coursesData.ts', 'utf8');

const newRoadmap = `export const ROADMAP_NODES: RoadmapNode[] = [
  {
    id: 'node-1',
    title: 'Level 1: The Syntax Awakening',
    description: 'Learn the basic grammar and vocabulary of the language. Variables, basic types, and simple I/O operations.',
    estimatedHours: 5,
    xpReward: 500,
    starsReward: 10,
    status: 'completed',
    modules: [
      { id: 'm1-1', title: 'Language Genesis: Hello World', duration: '1 hr', completed: true },
      { id: 'm1-2', title: 'Data Types & Memory', duration: '2 hrs', completed: true },
      { id: 'm1-3', title: 'Basic Operators & Logic', duration: '2 hrs', completed: true }
    ]
  },
  {
    id: 'node-2',
    title: 'Level 2: The Control Flow Trials',
    description: 'Master loops, conditionals, and branching logic to direct the flow of your programs.',
    estimatedHours: 8,
    xpReward: 800,
    starsReward: 15,
    status: 'in_progress',
    modules: [
      { id: 'm2-1', title: 'If, Else & Branching', duration: '3 hrs', completed: true },
      { id: 'm2-2', title: 'While & For Loop Mastery', duration: '3 hrs', completed: false },
      { id: 'm2-3', title: 'Error Handling & Exceptions', duration: '2 hrs', completed: false }
    ]
  },
  {
    id: 'node-3',
    title: 'Level 3: The Data Structure Labyrinth',
    description: 'Unlock arrays, hash maps, linked lists, and objects to store and manipulate complex data.',
    estimatedHours: 12,
    xpReward: 1200,
    starsReward: 20,
    status: 'locked',
    modules: [
      { id: 'm3-1', title: 'Arrays & Vectors', duration: '4 hrs', completed: false },
      { id: 'm3-2', title: 'Hash Maps & Dictionaries', duration: '4 hrs', completed: false },
      { id: 'm3-3', title: 'Object-Oriented Abstractions', duration: '4 hrs', completed: false }
    ]
  },
  {
    id: 'node-4',
    title: 'Level 4: The Architect\\'s Peak',
    description: 'Conquer advanced patterns, concurrency, and real-world system integrations.',
    estimatedHours: 20,
    xpReward: 2500,
    starsReward: 30,
    status: 'locked',
    modules: [
      { id: 'm4-1', title: 'Concurrency & Async Programming', duration: '8 hrs', completed: false },
      { id: 'm4-2', title: 'File I/O & Networking', duration: '6 hrs', completed: false },
      { id: 'm4-3', title: 'Building a Capstone Project', duration: '6 hrs', completed: false }
    ]
  }
];`;

content = content.replace(/export const ROADMAP_NODES: RoadmapNode\[\] = \[[\s\S]*?\];/, newRoadmap);
fs.writeFileSync('src/data/coursesData.ts', content);
