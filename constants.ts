import { Device, DeviceStatus, LabName } from './types';

export const MOCK_DEVICES: Device[] = [
  {
    id: 'PAT-001',
    name: 'Dell Inspiron 15',
    brand: 'Dell',
    model: 'Inspiron 15',
    processor: 'i5 11th Gen',
    ram: '8GB',
    storage: '256GB SSD',
    lab: 'Laboratório A (Ciências)',
    status: DeviceStatus.OPERATIONAL,
    specs: 'i5 11th Gen, 8GB RAM',
    lastCheck: '2023-10-25',
    logs: [],
    checkHistory: []
  },
  {
    id: 'PAT-002',
    name: 'Dell Inspiron 15',
    brand: 'Dell',
    model: 'Inspiron 15',
    processor: 'i5 11th Gen',
    ram: '8GB',
    storage: '256GB SSD',
    lab: 'Laboratório A (Ciências)',
    status: DeviceStatus.MAINTENANCE,
    specs: 'i5 11th Gen, 8GB RAM',
    lastCheck: '2023-10-24',
    logs: [
      { id: 1, date: '2023-10-24', description: 'Teclado falhando na letra A', type: 'maintenance' }
    ],
    checkHistory: []
  },
  {
    id: 'PAT-003',
    name: 'Lenovo ThinkPad',
    brand: 'Lenovo',
    model: 'ThinkPad E14',
    processor: 'Ryzen 5',
    ram: '16GB',
    storage: '512GB SSD',
    lab: 'Laboratório B (Informática)',
    status: DeviceStatus.OPERATIONAL,
    specs: 'Ryzen 5, 16GB RAM',
    lastCheck: '2023-10-26',
    logs: [],
    checkHistory: []
  },
  {
    id: 'PAT-004',
    name: 'Lenovo ThinkPad',
    brand: 'Lenovo',
    model: 'ThinkPad E14',
    processor: 'Ryzen 5',
    ram: '16GB',
    storage: '512GB SSD',
    lab: 'Laboratório B (Informática)',
    status: DeviceStatus.BROKEN,
    specs: 'Ryzen 5, 16GB RAM',
    lastCheck: '2023-10-20',
    logs: [
      { id: 2, date: '2023-10-20', description: 'Tela azul constante ao iniciar', type: 'error' }
    ],
    checkHistory: []
  },
  {
    id: 'PAT-005',
    name: 'Positivo Master',
    brand: 'Positivo',
    model: 'Master',
    processor: 'i3 10th Gen',
    ram: '4GB',
    storage: '1TB HDD',
    lab: 'Laboratório C (Robótica)',
    status: DeviceStatus.OPERATIONAL,
    specs: 'i3 10th Gen, 4GB RAM',
    lastCheck: '2023-10-26',
    logs: [],
    checkHistory: []
  },
  {
    id: 'PAT-006',
    name: 'Positivo Master',
    brand: 'Positivo',
    model: 'Master',
    processor: 'i3 10th Gen',
    ram: '4GB',
    storage: '1TB HDD',
    lab: 'Laboratório C (Robótica)',
    status: DeviceStatus.MISSING,
    specs: 'i3 10th Gen, 4GB RAM',
    lastCheck: '2023-09-15',
    logs: [
      { id: 3, date: '2023-09-15', description: 'Não encontrado na bancada 4', type: 'info' }
    ],
    checkHistory: []
  },
  {
    id: 'PAT-007',
    name: 'Dell Inspiron 15',
    brand: 'Dell',
    model: 'Inspiron 15',
    processor: 'i5 11th Gen',
    ram: '8GB',
    storage: '256GB SSD',
    lab: 'Laboratório A (Ciências)',
    status: DeviceStatus.OPERATIONAL,
    specs: 'i5 11th Gen, 8GB RAM',
    lastCheck: '2023-10-25',
    logs: [],
    checkHistory: []
  },
  {
    id: 'PAT-008',
    name: 'Lenovo ThinkPad',
    brand: 'Lenovo',
    model: 'ThinkPad E14',
    processor: 'Ryzen 5',
    ram: '16GB',
    storage: '512GB SSD',
    lab: 'Laboratório B (Informática)',
    status: DeviceStatus.MAINTENANCE,
    specs: 'Ryzen 5, 16GB RAM',
    lastCheck: '2023-10-22',
    logs: [
      { id: 4, date: '2023-10-22', description: 'Cooler fazendo barulho alto', type: 'maintenance' }
    ],
    checkHistory: []
  }
];
