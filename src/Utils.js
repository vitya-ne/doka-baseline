import {
    statusTypes,
    implementationTypes,
    implementationStatusTypes,
    browserNameList,
} from './Types';
import { messages } from './locales/ru/Messages.ru';

const DEFAULT = {
    implementation: implementationTypes.NOT_SUPPORTED,
};

const getBrowserImplementationList = (
    implementations,
    defaultData = DEFAULT.implementation,
) => {
    return browserNameList.map(browserName => ({
        id: browserName,
        data: implementations?.[browserName] ?? defaultData,
    }));
};

const EMPTY_BASELINE_OBJ = {
    name: messages.unknownName,
    badge: messages.no_data.badge,
    supportStatus: statusTypes.NO_DATA,
    implementations: getBrowserImplementationList(
        null,
        implementationTypes.UNKNOWN,
    ),
    specification: null,
};

const LOADING_BASELINE_OBJ = {
    name: '',
    badge: messages.loading.badge,
    loading: true,
};

const getAriaLabel = obj => {
    const { badge, supportStatus, implementations, dates, loading } = obj;

    const labelPar1 = [badge, dates?.year].filter(Boolean).join(' ');

    if (loading) {
        return labelPar1;
    }

    const statuses = implementations.map(browser => browser.data.status);

    if (supportStatus === statusTypes.NO_DATA) {
        statuses.fill(implementationStatusTypes.UNKNOWN);
    }

    const labelPart2 = implementations
        .map((browser, index) => {
            const id = browser.id;
            return `${messages.supported[id]}: ${messages.supportedStatus[statuses[index]]}.`;
        })
        .join(' ');

    return `${labelPar1 ? `${labelPar1}. ` : ''}${labelPart2}`;
};

const getDescription = obj => {
    const { supportStatus, dates = {}, id, specification, loading } = obj;

    if (loading) return {};

    const { fullDate } = dates;

    const result = {
        text: `${messages[supportStatus].description}${fullDate ? ` ${messages.date} ${fullDate}` : '.'}`,
        ...(supportStatus !== statusTypes.NO_DATA && {
            featureLink: `https://web-platform-dx.github.io/web-features-explorer/features/${id}/`,
            featureLinkText: messages.featureLinkText,
        }),
        ...(specification && {
            specLinks: specification.links.map(item => item.link),
            specLinkText: messages.specLinkText,
        }),
    };

    return result;
};

const getBaselineDates = baseline => {
    const { low_date: lowDateStr, high_date: highDateStr } = baseline;

    const dateStr = highDateStr ?? lowDateStr;

    const year = dateStr ? dateStr.split('-')[0] : '';
    const fullDate = dateStr
        ? new Intl.DateTimeFormat('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          }).format(new Date(dateStr))
        : '';

    return {
        fullDate,
        year,
    };
};

const getEmptyBaselineObject = sourceData => {
    const data = {
        ...EMPTY_BASELINE_OBJ,
        ...(sourceData?.loading && { ...LOADING_BASELINE_OBJ }),
        ...(sourceData?.feature_id && { name: sourceData.feature_id }),
    };

    return {
        ...data,
        description: getDescription(data),
        ariaLabel: getAriaLabel(data),
    };
};

export const transformToBaselineObject = responseData => {
    if (!responseData || !responseData.baseline) {
        return getEmptyBaselineObject(responseData);
    }

    const {
        name,
        baseline,
        browser_implementations: implementations = {},
        feature_id: id,
        spec: specification = {},
    } = responseData;

    const supportStatus = baseline.status || statusTypes.NO_DATA;
    const badge = messages[supportStatus].badge;
    const dates = getBaselineDates(baseline);

    const data = {
        name,
        badge,
        id,
        supportStatus,
        implementations: getBrowserImplementationList(implementations),
        dates,
        showYear: supportStatus === statusTypes.NEWLY && dates.year !== '',
        specification,
    };

    return {
        ...data,
        description: getDescription(data),
        ariaLabel: getAriaLabel(data),
    };
};
