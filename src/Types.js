export const statusTypes = {
    NO_DATA: 'no_data',
};

export const implementationStatusTypes = {
    YES: 'available',
    NO: 'unavailable',
    UNKNOWN: 'no_data',
};

export const implementationTypes = {
    SUPPORTED: { status: implementationStatusTypes.YES },
    NOT_SUPPORTED: { status: implementationStatusTypes.NO },
    UNKNOWN: { status: implementationStatusTypes.UNKNOWN },
};

export const browserNameList = ['chrome', 'edge', 'firefox', 'safari'];
