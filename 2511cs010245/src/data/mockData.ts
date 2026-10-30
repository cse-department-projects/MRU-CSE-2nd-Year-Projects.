// Mock data layer for VMTS.
// Shapes mirror the future Spring Boot REST responses so the UI can later
// swap these arrays for fetch() calls without redesign.

export type VehicleStatus = "Active" | "Inactive" | "Maintenance";
export type DriverStatus = "Active" | "Inactive" | "Suspended";
export type ServiceStatus = "Scheduled" | "Completed" | "Due Soon" | "Overdue";

export interface Vehicle {
  id: number;
  registrationNumber: string;
  manufacturer: string;
  model: string;
  year: number;
  driverId: number | null;
  status: VehicleStatus;
  lastUpdated: string;
  lastStartAt: string | null;
  remarks: string;
}

export interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseStatus: "Valid" | "Expiring Soon" | "Expired";
  vehicleId: number | null;
  status: DriverStatus;
  createdAt: string;
  lastActivity: string;
}

export interface ServiceRecord {
  id: number;
  vehicleId: number;
  serviceType: string;
  serviceDate: string;
  nextServiceDate: string;
  description: string;
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleLocation {
  vehicleId: number;
  latitude: number;
  longitude: number;
  updatedAt: string;
  place: string;
}

export interface AuditLog {
  id: number;
  user: string;
  role: "Admin" | "Driver";
  action: string;
  entity: string;
  reference: string;
  timestamp: string;
}

export interface Account {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "DRIVER";
  driverId?: number;
}

export const accounts: Account[] = [
  { id: 1, name: "R. Kulkarni", email: "admin@vmts.com", password: "admin123", role: "ADMIN" },
  {
    id: 2,
    name: "Suresh Reddy",
    email: "driver@vmts.com",
    password: "driver123",
    role: "DRIVER",
    driverId: 1,
  },
];

export const drivers: Driver[] = [
  {
    id: 1,
    name: "Suresh Reddy",
    email: "driver@vmts.com",
    phone: "+91 98490 11223",
    licenseNumber: "TS0120180012345",
    licenseStatus: "Valid",
    vehicleId: 1,
    status: "Active",
    createdAt: "2025-11-04",
    lastActivity: "2026-08-08 21:40",
  },
  {
    id: 2,
    name: "Anil Kumar",
    email: "anil.kumar@vmts.com",
    phone: "+91 99590 44120",
    licenseNumber: "TS0920190045612",
    licenseStatus: "Valid",
    vehicleId: 2,
    status: "Active",
    createdAt: "2025-12-12",
    lastActivity: "2026-08-08 18:05",
  },
  {
    id: 3,
    name: "Mahesh Naidu",
    email: "mahesh.naidu@vmts.com",
    phone: "+91 90005 78123",
    licenseNumber: "AP0920170098741",
    licenseStatus: "Expiring Soon",
    vehicleId: 3,
    status: "Active",
    createdAt: "2026-01-20",
    lastActivity: "2026-08-07 09:12",
  },
  {
    id: 4,
    name: "Praveen Rao",
    email: "praveen.rao@vmts.com",
    phone: "+91 91778 20034",
    licenseNumber: "TS1020200011234",
    licenseStatus: "Valid",
    vehicleId: 4,
    status: "Active",
    createdAt: "2026-02-02",
    lastActivity: "2026-08-06 16:30",
  },
  {
    id: 5,
    name: "Imran Sheikh",
    email: "imran.sheikh@vmts.com",
    phone: "+91 93910 55447",
    licenseNumber: "TS0820160077412",
    licenseStatus: "Valid",
    vehicleId: 5,
    status: "Inactive",
    createdAt: "2026-03-15",
    lastActivity: "2026-07-28 11:00",
  },
  {
    id: 6,
    name: "Lakshmi Prasad",
    email: "lakshmi.prasad@vmts.com",
    phone: "+91 98663 90021",
    licenseNumber: "TS0720150033218",
    licenseStatus: "Valid",
    vehicleId: null,
    status: "Active",
    createdAt: "2026-04-09",
    lastActivity: "2026-08-05 08:45",
  },
  {
    id: 7,
    name: "Venkat Rami Reddy",
    email: "venkat.reddy@vmts.com",
    phone: "+91 94400 12876",
    licenseNumber: "AP1620180066543",
    licenseStatus: "Expired",
    vehicleId: null,
    status: "Suspended",
    createdAt: "2026-05-21",
    lastActivity: "2026-06-30 14:20",
  },
];

export const vehicles: Vehicle[] = [
  {
    id: 1,
    registrationNumber: "TS09AB1234",
    manufacturer: "Maruti Suzuki",
    model: "Swift",
    year: 2021,
    driverId: 1,
    status: "Active",
    lastUpdated: "2026-08-08 21:40",
    lastStartAt: "2026-08-08 09:05",
    remarks: "Routine city duty.",
  },
  {
    id: 2,
    registrationNumber: "TS08CD4521",
    manufacturer: "Tata Motors",
    model: "Nexon",
    year: 2022,
    driverId: 2,
    status: "Active",
    lastUpdated: "2026-08-08 18:05",
    lastStartAt: "2026-08-08 08:20",
    remarks: "",
  },
  {
    id: 3,
    registrationNumber: "AP09EF7821",
    manufacturer: "Mahindra",
    model: "Bolero",
    year: 2019,
    driverId: 3,
    status: "Maintenance",
    lastUpdated: "2026-08-07 09:12",
    lastStartAt: "2026-08-05 07:50",
    remarks: "Brake inspection pending at depot workshop.",
  },
  {
    id: 4,
    registrationNumber: "TS10GH9034",
    manufacturer: "Toyota",
    model: "Innova Crysta",
    year: 2023,
    driverId: 4,
    status: "Active",
    lastUpdated: "2026-08-06 16:30",
    lastStartAt: "2026-08-06 07:15",
    remarks: "",
  },
  {
    id: 5,
    registrationNumber: "TS07JK5590",
    manufacturer: "Ashok Leyland",
    model: "Dost+",
    year: 2020,
    driverId: 5,
    status: "Inactive",
    lastUpdated: "2026-07-28 11:00",
    lastStartAt: "2026-07-27 06:40",
    remarks: "Off-road, awaiting driver reassignment.",
  },
  {
    id: 6,
    registrationNumber: "TS11LM3345",
    manufacturer: "Hyundai",
    model: "Creta",
    year: 2022,
    driverId: null,
    status: "Active",
    lastUpdated: "2026-08-04 13:25",
    lastStartAt: null,
    remarks: "",
  },
  {
    id: 7,
    registrationNumber: "AP16NP8812",
    manufacturer: "Tata Motors",
    model: "Ace Gold",
    year: 2018,
    driverId: null,
    status: "Maintenance",
    lastUpdated: "2026-08-02 10:10",
    lastStartAt: null,
    remarks: "Engine service in progress.",
  },
];

export const services: ServiceRecord[] = [
  {
    id: 1,
    vehicleId: 1,
    serviceType: "Oil Change",
    serviceDate: "2026-05-10",
    nextServiceDate: "2026-08-10",
    description: "Engine oil and filter replacement.",
    status: "Due Soon",
    createdAt: "2026-05-10",
    updatedAt: "2026-08-01",
  },
  {
    id: 2,
    vehicleId: 2,
    serviceType: "General Service",
    serviceDate: "2026-05-14",
    nextServiceDate: "2026-08-14",
    description: "Periodic 20,000 km general service.",
    status: "Scheduled",
    createdAt: "2026-05-14",
    updatedAt: "2026-07-30",
  },
  {
    id: 3,
    vehicleId: 3,
    serviceType: "Brake Inspection",
    serviceDate: "2026-05-05",
    nextServiceDate: "2026-08-05",
    description: "Front brake pad wear reported by driver.",
    status: "Overdue",
    createdAt: "2026-05-05",
    updatedAt: "2026-08-06",
  },
  {
    id: 4,
    vehicleId: 4,
    serviceType: "Tyre Rotation",
    serviceDate: "2026-06-18",
    nextServiceDate: "2026-09-18",
    description: "Rotation and pressure check for all four tyres.",
    status: "Scheduled",
    createdAt: "2026-06-18",
    updatedAt: "2026-06-18",
  },
  {
    id: 5,
    vehicleId: 5,
    serviceType: "Battery Replacement",
    serviceDate: "2026-04-22",
    nextServiceDate: "2026-08-12",
    description: "Battery replaced with 65Ah unit.",
    status: "Due Soon",
    createdAt: "2026-04-22",
    updatedAt: "2026-08-01",
  },
  {
    id: 6,
    vehicleId: 6,
    serviceType: "Air Filter Replacement",
    serviceDate: "2026-07-01",
    nextServiceDate: "2026-10-01",
    description: "Cabin and engine air filter replaced.",
    status: "Completed",
    createdAt: "2026-07-01",
    updatedAt: "2026-07-01",
  },
  {
    id: 7,
    vehicleId: 7,
    serviceType: "Engine Service",
    serviceDate: "2026-07-25",
    nextServiceDate: "2026-08-04",
    description: "Engine overheating complaint under inspection.",
    status: "Overdue",
    createdAt: "2026-07-25",
    updatedAt: "2026-08-06",
  },
  {
    id: 8,
    vehicleId: 1,
    serviceType: "Wheel Alignment",
    serviceDate: "2026-03-11",
    nextServiceDate: "2026-09-11",
    description: "Alignment and balancing completed.",
    status: "Completed",
    createdAt: "2026-03-11",
    updatedAt: "2026-03-11",
  },
  {
    id: 9,
    vehicleId: 2,
    serviceType: "AC Service",
    serviceDate: "2026-04-02",
    nextServiceDate: "2026-10-02",
    description: "Coolant top-up and blower cleaning.",
    status: "Completed",
    createdAt: "2026-04-02",
    updatedAt: "2026-04-02",
  },
  {
    id: 10,
    vehicleId: 4,
    serviceType: "Insurance Renewal Check",
    serviceDate: "2026-06-30",
    nextServiceDate: "2026-08-16",
    description: "Verify policy documents before renewal.",
    status: "Due Soon",
    createdAt: "2026-06-30",
    updatedAt: "2026-08-02",
  },
  {
    id: 11,
    vehicleId: 3,
    serviceType: "Clutch Adjustment",
    serviceDate: "2026-02-14",
    nextServiceDate: "2026-08-14",
    description: "Clutch play adjusted during last workshop visit.",
    status: "Scheduled",
    createdAt: "2026-02-14",
    updatedAt: "2026-07-20",
  },
  {
    id: 12,
    vehicleId: 6,
    serviceType: "Suspension Check",
    serviceDate: "2026-07-12",
    nextServiceDate: "2026-11-12",
    description: "Rear suspension noise inspected, no fault found.",
    status: "Completed",
    createdAt: "2026-07-12",
    updatedAt: "2026-07-12",
  },
];

export const locations: VehicleLocation[] = [
  { vehicleId: 1, latitude: 17.385, longitude: 78.4867, updatedAt: "2026-08-08 22:30", place: "Abids, Hyderabad" },
  { vehicleId: 2, latitude: 17.4483, longitude: 78.3915, updatedAt: "2026-08-08 21:10", place: "Hitec City, Hyderabad" },
  { vehicleId: 3, latitude: 16.5062, longitude: 80.648, updatedAt: "2026-08-07 09:12", place: "Vijayawada Depot" },
  { vehicleId: 4, latitude: 17.4239, longitude: 78.4738, updatedAt: "2026-08-08 20:02", place: "Begumpet, Hyderabad" },
  { vehicleId: 5, latitude: 17.3616, longitude: 78.4747, updatedAt: "2026-07-28 11:00", place: "Charminar, Hyderabad" },
  { vehicleId: 6, latitude: 17.4933, longitude: 78.3915, updatedAt: "2026-08-04 13:25", place: "Kompally, Hyderabad" },
  { vehicleId: 7, latitude: 16.3067, longitude: 80.4365, updatedAt: "2026-08-02 10:10", place: "Guntur Workshop" },
];

export const auditLogs: AuditLog[] = [
  { id: 1, user: "R. Kulkarni", role: "Admin", action: "Created", entity: "Vehicle", reference: "TS11LM3345", timestamp: "2026-08-08 22:25" },
  { id: 2, user: "Suresh Reddy", role: "Driver", action: "Started Vehicle", entity: "Vehicle", reference: "TS09AB1234", timestamp: "2026-08-08 22:12" },
  { id: 3, user: "R. Kulkarni", role: "Admin", action: "Updated", entity: "Driver", reference: "Mahesh Naidu", timestamp: "2026-08-08 21:58" },
  { id: 4, user: "Anil Kumar", role: "Driver", action: "Updated", entity: "Vehicle", reference: "TS08CD4521", timestamp: "2026-08-08 18:05" },
  { id: 5, user: "R. Kulkarni", role: "Admin", action: "Created", entity: "Service", reference: "TS10GH9034 / Insurance Renewal Check", timestamp: "2026-08-08 16:40" },
  { id: 6, user: "R. Kulkarni", role: "Admin", action: "Deleted", entity: "Service", reference: "TS07JK5590 / Duplicate entry", timestamp: "2026-08-08 15:02" },
  { id: 7, user: "Mahesh Naidu", role: "Driver", action: "Started Vehicle", entity: "Vehicle", reference: "AP09EF7821", timestamp: "2026-08-07 07:50" },
  { id: 8, user: "R. Kulkarni", role: "Admin", action: "Updated", entity: "Vehicle", reference: "AP16NP8812", timestamp: "2026-08-06 19:30" },
  { id: 9, user: "Praveen Rao", role: "Driver", action: "Updated", entity: "Vehicle", reference: "TS10GH9034", timestamp: "2026-08-06 16:30" },
  { id: 10, user: "R. Kulkarni", role: "Admin", action: "Created", entity: "Driver", reference: "Lakshmi Prasad", timestamp: "2026-08-05 10:15" },
  { id: 11, user: "R. Kulkarni", role: "Admin", action: "Updated", entity: "Service", reference: "TS09AB1234 / Oil Change", timestamp: "2026-08-04 11:45" },
  { id: 12, user: "Imran Sheikh", role: "Driver", action: "Updated", entity: "Vehicle", reference: "TS07JK5590", timestamp: "2026-07-28 11:00" },
  { id: 13, user: "R. Kulkarni", role: "Admin", action: "Deleted", entity: "Driver", reference: "Temporary account", timestamp: "2026-07-26 09:20" },
  { id: 14, user: "R. Kulkarni", role: "Admin", action: "Created", entity: "Vehicle", reference: "AP16NP8812", timestamp: "2026-07-20 14:05" },
];

export const dashboardTotals = {
  totalVehicles: 42,
  activeDrivers: 28,
};
