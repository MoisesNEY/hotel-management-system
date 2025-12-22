
export const extractErrorMessage = (error: any, defaultMessage: string = 'Ocurrió un error inesperado'): string => {
    if (!error) return defaultMessage;

    // 1. JHipster / RFC 7807 Problem Details
    // "detail" is the human readable description. "title" is the summary.
    if (error.response?.data?.detail) {
        return error.response.data.detail;
    }

    // 2. Some validation errors might put the message in "title" if detail is empty, 
    // but usually title is "Bad Request". We trust detail more.
    if (error.response?.data?.title && error.response.data.title !== 'Bad Request' && error.response.data.title !== 'Internal Server Error') {
        return error.response.data.title;
    }

    // 3. JHipster might return a "message" key which is a translation key usually, but sometimes plain text.
    // We try to avoid keys like "error.validation".
    if (error.response?.data?.message && !error.response.data.message.startsWith('error.')) {
        return error.response.data.message;
    }

    // 4. Field Errors (Validation)
    if (error.response?.data?.fieldErrors && Array.isArray(error.response.data.fieldErrors)) {
        const firstError = error.response.data.fieldErrors[0];
        return `${firstError.field}: ${firstError.message}`;
    }

    // 5. Native Axios message
    if (error.message && error.message !== 'Network Error') {
        return error.message;
    }

    return defaultMessage;
};
