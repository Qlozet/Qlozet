import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import {
  removeCookie,
  getCookies,
  saveCookie,
} from '@/lib/helpers/cookies-manager';
import { SESSION_COOKIE_KEY } from '@/lib/constants';

const USER_DETAILS_KEY = 'AltireuserDetails';
const PRODUCT_ID_KEY = 'productId';
const CUSTOMER_KEY = 'customer';

// Type safety for user data
interface UserDetails {
  // Define the structure of your user object
  id?: string;
  name?: string;
  email?: string;
  businessName?: string;
  personalName?: string;
  profileImage?: string;
  profilePic?: string;
  averageRating?: string;
  profit?: string;
  items?: string;
  ratings?: string;
}

export const setToken = (data: string): void => {
  saveCookie({
    key: SESSION_COOKIE_KEY,
    value: data,
    isObject: false,
  });
};

export const getToken = (): string | null => {
  return getCookies({ key: SESSION_COOKIE_KEY, isObject: false });
};

export const clearToken = (): boolean => {
  removeCookie(SESSION_COOKIE_KEY);
  return true;
};

export const setUserData = (data: UserDetails): void => {
  localStorage.setItem(USER_DETAILS_KEY, JSON.stringify(data));
};

export const getGetUserDetails = (): UserDetails | null => {
  const data = localStorage.getItem(USER_DETAILS_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearUserDetails = (): boolean => {
  localStorage.removeItem(USER_DETAILS_KEY);
  return true;
};

export const setProductId = (data: string): void => {
  localStorage.setItem(PRODUCT_ID_KEY, JSON.stringify(data));
};

export const getProductId = (): string | null => {
  const data = localStorage.getItem(PRODUCT_ID_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearProductId = (): boolean => {
  localStorage.removeItem(PRODUCT_ID_KEY);
  return true;
};

interface LocalStorageHandlers {
  getCustomerId: () => string | null;
  setCustomerId: (id: string) => void;
}

export const getCustomerId = (): string | null => {
  const data = localStorage.getItem(CUSTOMER_KEY);
  return data ? JSON.parse(data) : null;
};

export const setCustomerId = (id: string): void => {
  localStorage.setItem(CUSTOMER_KEY, JSON.stringify(id));
};

export const clearCustomerId = (): boolean => {
  localStorage.removeItem(CUSTOMER_KEY);
  return true;
};

// A general function to clear all relevant user data on logout
export const deleteData = (): void => {
  clearToken();
  clearUserDetails();
  clearProductId();
  clearCustomerId();
};

// From src/utils/helper.ts
import exportFromJSON from 'export-from-json';
import toast from 'react-hot-toast';
import { ValidationResult } from '@/types';
import { store } from '@/redux/store';
import { productsApiSlice } from '@/redux/services/products/products.api-slice';

export const handlerContainsNumber = (str: string): boolean => {
  const regex = /\d/;
  return regex.test(str);
};

export const handleContainsSymbolOrCharacter = (str: string): boolean => {
  const regex = /[^a-zA-Z0-9]/;
  return regex.test(str);
};

export const validator = (
  formData: { [key: string]: any },
  requiredFormData: { [key: string]: any }
): ValidationResult => {
  let firstErrorId: string | undefined = undefined;
  let result: ValidationResult = {
    status: true,
    data: {},
    id: undefined,
  };

  for (const key in formData) {
    if (requiredFormData.hasOwnProperty(key)) {
      if (!formData[key]) {
        if (!firstErrorId) {
          firstErrorId = key;
        }
        result = {
          status: false,
          data: { ...result.data, [key]: true },
          id: firstErrorId,
        };
      } else {
        result = {
          status: result.status,
          data: { ...result.data, [key]: false },
          id: firstErrorId,
        };
      }
    }
  }
  return result;
};

export const filterSelectedItems = <T>(arr1: T[], arr2: T[]): T[] => {
  return arr1.filter((el) => !arr2.includes(el));
};

interface Priceable {
  price: number;
}

export const calculatePrice = (data: Priceable[]): number => {
  return data.reduce((sum, item) => sum + item.price, 0);
};

export const handleExport = (data: any[]): void => {
  const name = 'download';
  const type = 'csv';
  exportFromJSON({ data, name, type });
};

interface UploadResponse {
  asset_id: string;
  public_id: string;
  secure_url: string;
}

export const uploadSingleImage = async (
  file: File
): Promise<UploadResponse | null> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const result = await store.dispatch(
      productsApiSlice.endpoints.uploadSingleImage.initiate(formData)
    );

    if (result.data?.data?.secure_url) {
      return {
        asset_id: result.data.data.asset_id,
        public_id: result.data.data.public_id,
        secure_url: result.data.data.secure_url,
      };
    } else {
      toast.error('An error occurred');
      return null;
    }
  } catch (error) {
    console.error(error);
    toast.error('An error occurred');
    return null;
  }
};

type SizeMap = { [key: string]: string };

export const modifySizeHandler = (value: string): string => {
  const sizeMap: SizeMap = {
    'Extra small': 'XS',
    Small: 'S',
    Medium: 'M',
    Large: 'L',
    'Extra large': 'XL',
    'Extra Extra Large': 'XXL',
  };
  return sizeMap[value] || '';
};

interface StatusStyle {
  name: string;
  bg: string;
  text?: string;
}

export const statusHandler = (item: { status: string }): StatusStyle => {
  switch (item.status) {
    case 'out-for-delivery':
      return { name: 'Out for delivery', bg: '#D4CFCA', text: '#3E1C01' };
    case 'return':
      return { name: 'Return', bg: '#9747FF21', text: '#A869FA' };
    case 'pending':
      return { name: 'pending', bg: '#FFF7DE', text: '#FFB020' };
    case 'completed':
      return { name: 'completed', bg: '#33CC331A', text: '#33CC33' };
    case 'Successful':
      return { name: 'Successful', bg: '#FFF5F5', text: '#33CC33' };
    default:
      return { name: 'Return', bg: '#D4CFCA' };
  }
};

interface ProductStatus {
  text: string;
  bgColor: string;
  color: string;
}

export const activeCheck = (status: boolean): ProductStatus => {
  if (status) {
    return { text: 'Active', bgColor: '#33CC331A', color: '#33CC33' };
  } else {
    return { text: 'Inactive', bgColor: '#FFF5F5', color: '#FF3A3A' };
  }
};

export const customerActiveCheck = (status: string): ProductStatus => {
  if (status === 'active') {
    return { text: 'Active', bgColor: '#33CC331A', color: '#33CC33' };
  } else {
    return { text: 'Inactive', bgColor: '#FFF5F5', color: '#FF3A3A' };
  }
};

interface WalletStatus {
  text: string;
  bgColor: string;
  color: string;
}

export const walletStatusCheck = (item: string): WalletStatus => {
  switch (item) {
    case 'pending':
      return { text: 'pending', bgColor: '#FFF7DE', color: '#FFB020' };
    case 'completed':
      return { text: 'completed', bgColor: '#33CC331A', color: '#33CC33' };
    case 'successful':
      return { text: 'Successful', bgColor: '#33CC331A', color: '#33CC33' };
    default:
      return { color: 'Return', bgColor: '#D4CFCA', text: 'Return' };
  }
};

export const getRandomHexColor = (): string => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return `#${randomColor.padStart(6, '0')}`;
};

// From src/utils/filteringExistingItem.ts
export function filterExcludedItems<T>(
  items: T[],
  excludeItems: T[],
  key: keyof T
): T[] {
  return items.filter(
    (item) => !excludeItems.some((exclude) => exclude[key] === item[key])
  );
}

// From src/utils/navdata.ts
interface NavItem {
  item: string;
  link: string;
  navWidth: string;
  handleFunction: (data: string) => void;
}

export const settingNav: NavItem[] = [
  {
    item: 'Shop details',
    link: '',
    navWidth: 'min-w-[7.5rem] lg:min-w-w-[0]',
    handleFunction: (data: string) => {
      console.log(data);
    },
  },
  {
    item: 'Billing and invoice',
    navWidth: 'min-w-[10.5rem] lg:min-w-w-[0]',
    link: '',
    handleFunction: (data: string) => {
      console.log(data);
    },
  },
  {
    item: 'Warehouses',
    navWidth: 'min-w-[8rem] lg:min-w-w-[0]',
    link: '',
    handleFunction: (data: string) => {
      console.log(data);
    },
  },
  {
    item: 'Users and permissions',
    link: '',
    navWidth: 'min-w-[13rem] lg:min-w-w-[0]',
    handleFunction: (data: string) => {
      console.log(data);
    },
  },
  {
    item: 'Categories',
    link: '',
    navWidth: 'min-w-[8rem] lg:min-w-w-[0]',
    handleFunction: (data: string) => {
      console.log(data);
    },
  },
];

// Default export for validator (to maintain compatibility)
export default validator;
