export function filterExcludedItems<T>(items: T[], excludeItems: T[], key: keyof T): T[] {
    return items.filter(item =>
        !excludeItems.some(exclude => exclude[key] === item[key])
    );
}
