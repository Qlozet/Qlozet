import { env } from '@/env';
import { setCookie, parseCookies } from 'nookies';

interface ISaveCookie {
    key: string
    value: string
    isObject: boolean
}

export const saveCookie = ({ key, value, isObject }: ISaveCookie) => {
    const updatedValue = isObject ? JSON.stringify(value) : value;
    setCookie(null, key, updatedValue, {
        maxAge: 86400,
        path: '/',
        secure: env.NODE_ENV === 'production',
    });
};

interface IGetCookies {
    key: string;
    isObject?: boolean;
}

export const getCookies = ({ key, isObject }: IGetCookies) => {
    const cookies = parseCookies();
    const foundCookie = cookies[key];
    if (foundCookie) {
        if (isObject) {
            return JSON.parse(foundCookie);
        }
        return foundCookie;
    } else {
        return null;
    }
};

export const removeCookie = (key: string) => {
    setCookie(null, key, '', {
        maxAge: -1,
        path: '/',
        secure: env.NODE_ENV === 'production',
    });
};
