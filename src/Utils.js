import {
    statusTypes,
    implementationTypes,
    implementationStatusTypes,
} from './Types';
import { messages } from './Messages';

const DEFAULT = {
    implementation: implementationTypes.NOT_SUPPORTED,
};

const EMPTY_BASELINE_OBJ = {
    name: messages.unknownName,
    badge: messages.no_data.badge,
    supportStatus: statusTypes.NO_DATA,
    implementations: {
        chrome: implementationTypes.UNKNOWN,
        edge: implementationTypes.UNKNOWN,
        firefox: implementationTypes.UNKNOWN,
        safari: implementationTypes.UNKNOWN,
    },
};

const getAriaLabel = data => {
    const { badge, supportStatus, implementations, dates } = data;

    let chrome = implementations.chrome.status;
    let edge = implementations.edge.status;
    let firefox = implementations.firefox.status;
    let safari = implementations.safari.status;

    if (supportStatus === statusTypes.NO_DATA) {
        chrome = implementationStatusTypes.UNKNOWN;
        edge = implementationStatusTypes.UNKNOWN;
        firefox = implementationStatusTypes.UNKNOWN;
        safari = implementationStatusTypes.UNKNOWN;
    }

    const labelPar1 = [badge, dates?.year].filter(Boolean).join(' ');
    const labelPart2 = [
        `${messages.supportedInChrome}: ${messages.supportedStatus[chrome]}.`,
        `${messages.supportedInEdge}: ${messages.supportedStatus[edge]}.`,
        `${messages.supportedInFirefox}: ${messages.supportedStatus[firefox]}.`,
        `${messages.supportedInSafari}: ${messages.supportedStatus[safari]}.'`,
    ].join(' ');

    return `${labelPar1 ? `${labelPar1}. ` : ''}${labelPart2}`;
};

const getDescription = (supportStatus, dates = {}) => {
    const { fullDate } = dates;

    const description = messages[supportStatus].description;

    if (fullDate) {
        return `${description}. ${messages.date}: ${fullDate}`;
    }
    return description;
};

const getBaselineDates = baseline => {
    const { low_date: lowDateStr, high_date: highDateStr } = baseline;

    const dateStr = highDateStr ?? lowDateStr;

    const year = dateStr ? dateStr.split('-')[0] : '';
    return {
        fullDate: dateStr
            ? new Intl.DateTimeFormat('ru-RU', {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
              }).format(new Date(dateStr))
            : '',
        year,
    };
};

const getEmptyBaselineObj = sourceData => {
    const data = {
        ...EMPTY_BASELINE_OBJ,
        ...(sourceData?.feature_id && { name: sourceData.feature_id }),
        description: getDescription(EMPTY_BASELINE_OBJ.supportStatus),
    };

    console.log('getEmptyBaselineObj:', data, getAriaLabel(data));

    return {
        ...data,
        ariaLabel: getAriaLabel(data),
    };
};

export const transformToBaselineObject = responseData => {
    if (!responseData || !responseData.baseline) {
        return getEmptyBaselineObj(responseData);
    }

    const {
        name,
        baseline,
        browser_implementations: implementations = {},
        feature_id: id,
    } = responseData;

    const supportStatus = baseline.status || statusTypes.NO_DATA;
    const badge = messages[supportStatus].badge;
    const dates = getBaselineDates(baseline);
    const description = getDescription(supportStatus, dates);

    const data = {
        name,
        badge,
        id,
        supportStatus,
        implementations: {
            chrome: implementations.chrome ?? DEFAULT.implementation,
            edge: implementations.edge ?? DEFAULT.implementation,
            firefox: implementations.firefox ?? DEFAULT.implementation,
            safari: implementations.safari ?? DEFAULT.implementation,
        },
        dates,
        description,
    };

    console.log(':', { responseData, data });

    return {
        ...data,
        ariaLabel: getAriaLabel(data),
    };
};
