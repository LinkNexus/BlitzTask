export type FormErrors = { violations: { propertyPath: string, title: string }[] };

export function formErrors(errors: FormErrors | undefined, setErrors: (e: FormErrors) => void) {
    return {
        getErrors: (field: string) => {
            if (!errors || !errors.violations) return [];
            const fieldErrors: string[] = [];
            errors.violations.forEach(v => {
                if (v.propertyPath === field) {
                    fieldErrors.push(v.title);
                }
            });
            return fieldErrors;
        },
        hasErrors: (field: string) => {
            if (!errors || !errors.violations) return false;
            return errors.violations.some(v => v.propertyPath === field);
        },
        clearErrors: (field: string) => {
            if (!errors || !errors.violations) return;
            const updatedViolations = errors.violations.filter(v => v.propertyPath !== field);
            setErrors({violations: updatedViolations});
        }
    }
}