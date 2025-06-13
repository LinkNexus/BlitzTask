export const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

export const splitCamelCaseAndCapitalize = (str: string): string => {
    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert space before uppercase letters
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(' '); // Join back into a single string
}