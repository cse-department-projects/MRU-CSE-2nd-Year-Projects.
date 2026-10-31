const fs = require('fs');
let content = fs.readFileSync('src/data/mockData.ts', 'utf8');

const newRoadmap = `export const ROADMAP_NODES: RoadmapNode[] = [
  {
    id: 'node-1',
    title: 'Level 1: The Syntax Awakening',
    track: 'Language Core',
    tier: 1,
    category: 'Foundation',
    status: 'completed',
    xpReward: 500,
    starsReward: 15,
    durationHours: 6.0,
    description: 'Variables, basic types, memory layouts, and simple I/O operations.',
    subTopics: ['Data Types', 'Variables', 'Memory', 'I/O'],
    prerequisites: [],
    position: { x: 120, y: 180 }
  },
  {
    id: 'node-2',
    title: 'Level 2: The Control Flow Trials',
    track: 'Language Core',
    tier: 1,
    category: 'Foundation',
    status: 'in_progress',
    xpReward: 650,
    starsReward: 20,
    durationHours: 8.0,
    description: 'Loops, conditionals, and branching logic to direct the flow of your programs.',
    subTopics: ['If/Else', 'For Loops', 'While Loops', 'Exceptions'],
    prerequisites: ['node-1'],
    position: { x: 340, y: 140 }
  },
  {
    id: 'node-3',
    title: 'Level 3: The Data Structure Labyrinth',
    track: 'Structures',
    tier: 2,
    category: 'Core Systems',
    status: 'locked',
    xpReward: 850,
    starsReward: 25,
    durationHours: 9.5,
    description: 'Arrays, hash maps, linked lists, and objects to store and manipulate complex data.',
    subTopics: ['Arrays', 'Hash Maps', 'Trees', 'Graphs'],
    prerequisites: ['node-2'],
    position: { x: 560, y: 220 }
  },
  {
    id: 'node-4',
    title: 'Level 4: The Architect\\'s Peak',
    track: 'Architecture',
    tier: 3,
    category: 'Advanced',
    status: 'locked',
    xpReward: 2500,
    starsReward: 50,
    durationHours: 12.0,
    description: 'Conquer advanced patterns, concurrency, and real-world system integrations.',
    subTopics: ['Concurrency', 'Design Patterns', 'Networking', 'Capstone'],
    prerequisites: ['node-3'],
    position: { x: 780, y: 150 }
  }
];`;

content = content.replace(/export const ROADMAP_NODES: RoadmapNode\[\] = \[[\s\S]*?\];/g, newRoadmap);
fs.writeFileSync('src/data/mockData.ts', content);
