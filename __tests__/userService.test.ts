jest.mock('firebase/database', () => ({}));
jest.mock('../src/services/firebase', () => ({ auth: {}, db: {} }));

import { AppUser, filterContacts } from '../src/services/userService';

const users: AppUser[] = [
  { uid: 'me', name: 'Tôi', email: 'me@x.com', online: true },
  { uid: 'u1', name: 'Bình', email: 'binh@x.com', online: false },
  { uid: 'u2', name: 'An', email: 'an@y.com', online: true },
];

describe('filterContacts', () => {
  test('excludes myself', () => {
    expect(filterContacts(users, 'me', '').map(u => u.uid)).toEqual(['u1', 'u2']);
  });

  test('matches name case-insensitively with trimmed query', () => {
    expect(filterContacts(users, 'me', '  BÌNH ').map(u => u.uid)).toEqual(['u1']);
  });

  test('matches email', () => {
    expect(filterContacts(users, 'me', 'y.com').map(u => u.uid)).toEqual(['u2']);
  });
});
