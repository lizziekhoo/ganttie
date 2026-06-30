import type { Task } from "@/components/projects/interior-design-project";

export interface Project {
  id: string;
  title: string;
  clientName: string;
  location: string;
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  budget: string;
  description: string;
  tasks?: Task[];
}

// Demo seed data (project-a). Source of truth — reused by the component's
// defaultProjectData so the demo tasks/VOs/subtasks live in one place.
export const demoProjectTasks: Task[] = [
  {
    id: '1',
    name: 'Initial Consultation & Planning',
    status: 'completed',
    startDate: '2024-01-15',
    endDate: '2024-01-22',
    originalEndDate: '2024-01-22',
    phase: 'Phase 1',
    scope: 'Planning',
    dependency: null,
    duration: 7,
    assignee: 'Design Team',
    budget: 2500,
    lastUpdated: '2024-01-22',
    subTasks: [
      { id: 'st-1-1', description: 'Kickoff meeting with client', status: 'Done', priority: 'High', assignee: 'Design Team', reminderTime: '10:00', reminderFrequency: 'Weekdays' }
    ]
  },
  {
    id: '2',
    name: 'Space Measurement & Assessment',
    status: 'completed',
    startDate: '2024-01-23',
    endDate: '2024-01-26',
    originalEndDate: '2024-01-26',
    phase: 'Phase 1',
    scope: 'Planning',
    dependency: '1',
    duration: 3,
    assignee: 'Site Team',
    budget: 800,
    lastUpdated: '2024-01-26',
    variationOrders: [
      {
        id: 'vo-1',
        description: 'Additional structural measurements needed for load-bearing wall assessment',
        costImpact: 450,
        status: 'approved',
        loggedBy: 'John Site Manager',
        timestamp: '2024-01-25',
        reason: 'Required to finalize the load-bearing wall permit submission'
      }
    ]
  },
  {
    id: '3',
    name: 'Design Concept Development',
    status: 'completed',
    startDate: '2024-01-27',
    endDate: '2024-02-10',
    originalEndDate: '2024-02-10',
    phase: 'Phase 1',
    scope: 'Design',
    dependency: '2',
    duration: 14,
    assignee: 'Design Team',
    budget: 8500,
    lastUpdated: '2024-02-10',
    subTasks: [
      { id: 'st-3-1', description: 'Prepare mood board for client review', status: 'Done', priority: 'Medium', assignee: 'Design Team', reminderTime: '10:00', reminderFrequency: 'Weekdays' },
      { id: 'st-3-2', description: 'Finalize material palette', status: 'Done', priority: 'Medium', assignee: 'Design Team', reminderTime: '10:00', reminderFrequency: 'Weekdays' }
    ]
  },
  {
    id: '4',
    name: 'Material Selection & Procurement',
    status: 'completed',
    startDate: '2024-02-11',
    endDate: '2024-02-25',
    originalEndDate: '2024-02-25',
    phase: 'Phase 2',
    scope: 'Procurement',
    dependency: '3',
    duration: 14,
    assignee: 'Procurement',
    budget: 12000,
    lastUpdated: '2024-02-25',
    variationOrders: [
      {
        id: 'vo-2',
        description: 'Upgraded marble flooring as requested by client',
        costImpact: 1500,
        status: 'approved',
        loggedBy: 'Sarah Procurement',
        timestamp: '2024-02-18',
        reason: 'Client selected premium grade after the showroom visit'
      },
      {
        id: 'vo-3',
        description: 'Custom light fixtures from Italy - shipping cost adjustment',
        costImpact: 380,
        status: 'approved',
        loggedBy: 'Sarah Procurement',
        timestamp: '2024-02-22',
        reason: 'Air freight surcharge for expedited shipping'
      }
    ]
  },
  {
    id: '5',
    name: 'Demolition & Preparation',
    status: 'completed',
    startDate: '2024-02-26',
    endDate: '2024-03-05',
    originalEndDate: '2024-03-05',
    phase: 'Phase 2',
    scope: 'Construction',
    dependency: '4',
    duration: 8,
    assignee: 'Construction',
    budget: 4500,
    lastUpdated: '2024-03-05',
    variationOrders: [
      {
        id: 'vo-4',
        description: 'Hidden plumbing discovered - additional pipe replacement required',
        costImpact: 680,
        status: 'approved',
        loggedBy: 'Mike Foreman',
        timestamp: '2024-02-28',
        reason: 'Unforeseen condition discovered during demolition'
      }
    ]
  },
  {
    id: '6',
    name: 'Electrical & Lighting Installation',
    status: 'in-progress',
    startDate: '2024-03-06',
    endDate: '2024-03-20',
    originalEndDate: '2024-03-13',
    phase: 'Phase 2',
    scope: 'Electrical',
    dependency: '5',
    duration: 14,
    assignee: 'Electrical Team',
    budget: 6200,
    lastUpdated: '2024-03-18',
    delays: [
      { id: 'd-6-1', reason: 'Electrician team unavailable due to another project', duration: 2, date: '2024-03-10' },
      { id: 'd-6-2', reason: 'Fixture delivery delayed by supplier', duration: 1, date: '2024-03-14' }
    ],
    subTasks: [
      { id: 'st-6-1', description: 'Run new wiring to breaker panel', status: 'Done', priority: 'High', assignee: 'Alex Electrician', reminderTime: '09:00', reminderFrequency: 'Weekdays' },
      { id: 'st-6-2', description: 'Install recessed lighting fixtures', status: 'In Progress', priority: 'High', assignee: 'Alex Electrician', reminderTime: '09:00', reminderFrequency: 'Weekdays' },
      { id: 'st-6-3', description: 'Connect smart-home light switches', status: 'Todo', priority: 'Medium', assignee: 'Alex Electrician', reminderTime: '09:00', reminderFrequency: 'Weekdays' }
    ],
    variationOrders: [
      {
        id: 'vo-5',
        description: 'Additional recessed lighting in reading nook',
        costImpact: -150,
        status: 'approved',
        loggedBy: 'Alex Electrician',
        timestamp: '2024-03-15',
        reason: 'Client added a reading nook to the layout'
      },
      {
        id: 'vo-6',
        description: 'Smart home integration upgrade - premium switches',
        costImpact: 420,
        status: 'pending',
        loggedBy: 'Alex Electrician',
        timestamp: '2024-03-17',
        reason: 'Upgrade to premium smart switches (pending approval)'
      }
    ]
  },
  {
    id: '7',
    name: 'Flooring Installation',
    status: 'in-progress',
    startDate: '2024-03-21',
    endDate: '2024-04-03',
    originalEndDate: '2024-03-28',
    phase: 'Phase 2',
    scope: 'Flooring',
    dependency: '6',
    duration: 13,
    assignee: 'Construction',
    budget: 7800,
    lastUpdated: '2024-03-10', // Intentionally stale (8+ days ago)
    delays: [
      { id: 'd-7-1', reason: 'Subfloor repair needed after demolition uncovered water damage', duration: 2, date: '2024-03-24' }
    ],
    subTasks: [
      { id: 'st-7-1', description: 'Acclimatise hardwood planks on site', status: 'Done', priority: 'Medium', assignee: 'Construction', reminderTime: '08:00', reminderFrequency: 'Daily' },
      { id: 'st-7-2', description: 'Lay flooring in living room', status: 'In Progress', priority: 'High', assignee: 'Construction', reminderTime: '08:00', reminderFrequency: 'Daily' }
    ]
  },
  {
    id: '8',
    name: 'Furniture & Fixture Installation',
    status: 'pending',
    startDate: '2024-04-04',
    endDate: '2024-04-17',
    originalEndDate: '2024-04-17',
    phase: 'Phase 3',
    scope: 'Installation',
    dependency: '7',
    duration: 13,
    assignee: 'Installation Team',
    budget: 15000,
    lastUpdated: '2024-03-01',
    subTasks: [
      { id: 'st-8-1', description: 'Confirm delivery slot with supplier', status: 'Pending', priority: 'Medium', assignee: 'Procurement', reminderTime: '09:00', reminderFrequency: 'Weekdays' }
    ]
  },
  {
    id: '9',
    name: 'Final Styling & Decoration',
    status: 'pending',
    startDate: '2024-04-18',
    endDate: '2024-04-25',
    originalEndDate: '2024-04-25',
    phase: 'Phase 3',
    scope: 'Finishing',
    dependency: '8',
    duration: 7,
    assignee: 'Design Team',
    budget: 3500,
    lastUpdated: '2024-02-20'
  },
  {
    id: '10',
    name: 'Final Inspection & Handover',
    status: 'pending',
    startDate: '2024-04-26',
    endDate: '2024-04-30',
    originalEndDate: '2024-04-30',
    phase: 'Phase 3',
    scope: 'Handover',
    dependency: '9',
    duration: 4,
    assignee: 'Project Manager',
    budget: 1200,
    lastUpdated: '2024-02-15'
  }
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'project-a',
    title: 'Project A',
    clientName: 'Sarah Johnson',
    location: 'Beverly Hills, CA',
    status: 'In Progress',
    progress: 65,
    startDate: '2024-01-15',
    endDate: '2024-04-30',
    budget: '$85,000',
    description: 'Complete renovation of a 2,500 sq ft living space featuring modern minimalist design with natural materials, neutral color palette, and smart home integration.',
    tasks: demoProjectTasks
  },
  {
    id: 'project-b',
    title: 'Project B',
    clientName: 'Michael Chen',
    location: 'San Francisco, CA',
    status: 'In Progress',
    progress: 72,
    startDate: '2024-02-01',
    endDate: '2024-05-15',
    budget: '$120,000',
    description: 'Full kitchen remodel with custom cabinetry, high-end appliances, and an open-concept dining area for family gatherings.',
    tasks: [
      { id: 'b1', name: 'Cabinetry Design', status: 'completed', startDate: '2024-02-01', endDate: '2024-02-15', duration: 14, assignee: 'Design Team', scope: 'Design', phase: 'Phase 1' },
      { id: 'b2', name: 'Kitchen Demolition', status: 'completed', startDate: '2024-02-16', endDate: '2024-02-28', duration: 12, assignee: 'Construction', scope: 'Construction', phase: 'Phase 1' },
      { id: 'b3', name: 'Plumbing Rough-in', status: 'in-progress', startDate: '2024-03-01', endDate: '2024-03-20', duration: 20, assignee: 'Plumbing Team', scope: 'Plumbing', phase: 'Phase 2' },
      { id: 'b4', name: 'Countertop Installation', status: 'pending', startDate: '2024-04-01', endDate: '2024-04-15', duration: 14, assignee: 'Construction', scope: 'Finishing', phase: 'Phase 2' },
      { id: 'b5', name: 'Appliance Installation', status: 'pending', startDate: '2024-05-01', endDate: '2024-05-10', duration: 10, assignee: 'Installation Team', scope: 'Installation', phase: 'Phase 3' }
    ]
  },
  {
    id: 'project-c',
    title: 'Project C',
    clientName: 'Emily Rodriguez',
    location: 'Manhattan, NY',
    status: 'Planning',
    progress: 25,
    startDate: '2024-03-01',
    endDate: '2024-06-30',
    budget: '$95,000',
    description: 'Spa-inspired master bathroom renovation with heated floors, rain shower, and premium stone finishes.'
  },
  {
    id: 'project-d',
    title: 'Project D',
    clientName: 'David Thompson',
    location: 'Austin, TX',
    status: 'In Progress',
    progress: 48,
    startDate: '2024-02-15',
    endDate: '2024-04-20',
    budget: '$45,000',
    description: 'Conversion of spare bedroom into a functional home office with custom built-ins, soundproofing, and ergonomic design.'
  },
  {
    id: 'project-e',
    title: 'Project E',
    clientName: 'Jennifer Martinez',
    location: 'Miami, FL',
    status: 'Completed',
    progress: 100,
    startDate: '2023-11-01',
    endDate: '2024-02-28',
    budget: '$75,000',
    description: 'Complete backyard renovation with pool, outdoor kitchen, fire pit, and landscaping for year-round entertainment.'
  },
  {
    id: 'project-f',
    title: 'Project F',
    clientName: 'Robert Williams',
    location: 'Seattle, WA',
    status: 'In Progress',
    progress: 58,
    startDate: '2024-01-20',
    endDate: '2024-05-10',
    budget: '$68,000',
    description: 'Master bedroom suite addition with walk-in closet, en-suite bathroom, and panoramic window installation.'
  },
  {
    id: 'project-g',
    title: 'Project G',
    clientName: 'Lisa Anderson',
    location: 'Chicago, IL',
    status: 'Planning',
    progress: 15,
    startDate: '2024-04-01',
    endDate: '2024-08-30',
    budget: '$110,000',
    description: 'Full basement conversion into a recreational space with home theater, gym area, and guest bedroom.'
  },
  {
    id: 'project-h',
    title: 'Project H',
    clientName: 'Kevin Park',
    location: 'Boston, MA',
    status: 'In Progress',
    progress: 42,
    startDate: '2024-02-20',
    endDate: '2024-05-30',
    budget: '$55,000',
    description: 'Whole-home smart technology integration including lighting, climate, security, and entertainment systems.'
  },
  {
    id: 'project-i',
    title: 'Project I',
    clientName: 'Amanda Green',
    location: 'Portland, OR',
    status: 'Completed',
    progress: 100,
    startDate: '2023-09-15',
    endDate: '2024-01-31',
    budget: '$42,000',
    description: 'Eco-friendly garden design with native plants, rainwater harvesting, and sustainable hardscaping materials.'
  },
  {
    id: 'project-j',
    title: 'Project J',
    clientName: 'Christopher Lee',
    location: 'Phoenix, AZ',
    status: 'In Progress',
    progress: 38,
    startDate: '2024-03-10',
    endDate: '2024-07-15',
    budget: '$135,000',
    description: 'Luxury pool and spa installation with custom landscaping, outdoor lighting, and automated maintenance systems.'
  },
  {
    id: 'project-k',
    title: 'Project K',
    clientName: 'Michelle Davis',
    location: 'Denver, CO',
    status: 'Planning',
    progress: 8,
    startDate: '2024-05-01',
    endDate: '2024-08-20',
    budget: '$38,000',
    description: 'Professional home theater installation with acoustic treatment, projection system, and surround sound.'
  },
  {
    id: 'project-l',
    title: 'Project L',
    clientName: 'Daniel Wilson',
    location: 'San Diego, CA',
    status: 'Completed',
    progress: 100,
    startDate: '2023-10-15',
    endDate: '2024-02-28',
    budget: '$72,000',
    description: 'Garage conversion into a workshop and storage space with custom organization systems and work areas.'
  }
];
