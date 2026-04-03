import type { DevUserMode } from '@features/auth/types/devUserMode';

const STORAGE_KEY = 'enterprise-react-starter/dev-active-user-empno';
const MOCK_DELAY_MS = 140;

const mockUsers: DevUserMode[] = [
  {
    empNo: 17100208,
    name: '김삼성',
    nameEn: 'Holywater',
    role: 'GLOBAL_HR',
    divisionCode: 'C100001'
  },
  {
    empNo: 17100209,
    name: '이관리',
    nameEn: 'Admin Lee',
    role: 'ADMIN',
    divisionCode: 'C100001'
  },
  {
    empNo: 17101001,
    name: '박엠엑스',
    nameEn: 'Parker MX',
    role: 'DIVISION_HR',
    divisionCode: 'C100001'
  },
  {
    empNo: 17101002,
    name: '최디에스',
    nameEn: 'Choi DS',
    role: 'DIVISION_HR',
    divisionCode: 'C100061'
  },
  {
    empNo: 17101003,
    name: '정디엑스',
    nameEn: 'Jung DX',
    role: 'DIVISION_HR',
    divisionCode: 'C100121'
  },
  {
    empNo: 17101004,
    name: '한플랫폼',
    nameEn: 'Han Platform',
    role: 'DIVISION_HR',
    divisionCode: 'C100181'
  },
  {
    empNo: 17101005,
    name: '오글로벌',
    nameEn: 'Oh Global Ops',
    role: 'DIVISION_HR',
    divisionCode: 'C100241'
  },
  {
    empNo: 17101006,
    name: '유바이오',
    nameEn: 'Yu Bio',
    role: 'DIVISION_HR',
    divisionCode: 'C100301'
  },
  {
    empNo: 17101007,
    name: '윤에어로',
    nameEn: 'Yoon Aero',
    role: 'DIVISION_HR',
    divisionCode: 'C100401'
  },
  {
    empNo: 17101008,
    name: '문에너지',
    nameEn: 'Moon Energy',
    role: 'DIVISION_HR',
    divisionCode: 'C100501'
  },
  {
    empNo: 17101009,
    name: '강리테일',
    nameEn: 'Kang RetailTech',
    role: 'DIVISION_HR',
    divisionCode: 'C100601'
  },
  {
    empNo: 17101010,
    name: '신모빌리티',
    nameEn: 'Shin Mobility',
    role: 'DIVISION_HR',
    divisionCode: 'C100701'
  }
];

const delay = async () => new Promise((resolve) => globalThis.setTimeout(resolve, MOCK_DELAY_MS));

const getDefaultUser = () => mockUsers[0];

const readStoredEmpNo = () => {
  if (typeof window === 'undefined') {
    return getDefaultUser().empNo;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : getDefaultUser().empNo;
};

const persistEmpNo = (empNo: number) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, String(empNo));
};

const findByEmpNo = (empNo: number) => mockUsers.find((user) => user.empNo === empNo) ?? getDefaultUser();

export const mockUserApi = {
  async getUsers() {
    await delay();
    return mockUsers.map((user) => ({ ...user }));
  },

  async getActiveUser() {
    await delay();
    return { ...findByEmpNo(readStoredEmpNo()) };
  },

  async setActiveUser(empNo: number) {
    await delay();
    const user = findByEmpNo(empNo);
    persistEmpNo(user.empNo);
    return { ...user };
  }
};
