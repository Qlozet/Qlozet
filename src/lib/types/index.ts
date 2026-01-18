export interface Timezone {
    zoneName: string
    gmtOffset: number
    gmtOffsetName: string
    abbreviation: string
    tzName: string
}

export interface CountryProps {
    id: number
    name: string
    iso3: string
    iso2: string
    numeric_code: string
    phone_code: string
    capital: string
    currency: string
    currency_name: string
    currency_symbol: string
    tld: string
    native: string
    region: string
    region_id: string
    subregion: string
    subregion_id: string
    nationality: string
    timezones: Timezone[]
    translations: Record<string, string>
    latitude: string
    longitude: string
    emoji: string
    emojiU: string
}

export interface StateProps {
    id: number
    name: string
    country_id: number
    country_code: string
    country_name: string
    state_code: string
    type: string | null
    latitude: string
    longitude: string
}

export interface UseCounterOutput<T> {
    count: number;
    increment: () => void;
    decrement: () => void;
    reset: () => void;
    setCount: T;
}
export interface IUseBooleanOutputProps<T> {
    value: boolean;
    setValue: T;
    setTrue: () => void;
    setFalse: () => void;
    toggle: () => void;
}
export interface UseCountdownType {
    seconds: number;
    interval: number;
    isIncrement?: boolean;
}
export interface CountdownOption {
    countStart: number;
    intervalMs?: number;
    isIncrement?: boolean;
    countStop?: number;
}
export interface CountdownHelpers {
    start: () => void;
    stop: () => void;
    reset: () => void;
}
export interface CountdownControllers {
    startCountdown: () => void;
    stopCountdown: () => void;
    resetCountdown: () => void;
}

export interface IUseIntervalProps {
    callback: () => void;
    delay: number | null;
}