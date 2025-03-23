export function filterExcludedItems(items, excludeItems, key) {
    return items.filter(item =>
        !excludeItems.some(exclude => exclude[key] === item[key])
    );
}