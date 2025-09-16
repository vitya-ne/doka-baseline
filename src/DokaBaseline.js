import { html, css, LitElement } from 'lit';
import { Task } from '@lit/task';
// eslint-disable-next-line no-unused-vars
import BaselineIcon from '../libs/baseline-status/baseline-icon.js';
import { ICONS, SUPPORT_ICONS } from '../libs/baseline-status/browser-icons.js';
import { messages } from './Messages';

export class DokaBaseline extends LitElement {
    static styles = css`
        :host {
            display: block;
            padding: 25px;
            color: var(--doka-baseline-text-color, #000);
        }
    `;

    static properties = {
        groupId: { type: String },
    };

    constructor() {
        super();
        this.groupId = '';
    }

    fetchData = new Task(this, {
        task: async ([id], { signal }) => {
            const url = `https://api.webstatus.dev/v1/features/${id}`;
            const response = await fetch(url, { signal, cache: 'force-cache' });

            if (!response.ok) {
                throw new Error(response.status);
            }

            return response.json();
        },
        args: () => [this.groupId],
    });

    getDescription(supportStatus, baselineDate) {
        const { fullDate } = baselineDate;

        const description = messages[supportStatus].description;

        if (fullDate) {
            return `${description}. Дата: ${fullDate}`;
        }
        return description;
    }

    getBaselineDate(baseline) {
        const lowDateStr = baseline.low_date;
        const highDateStr = baseline.high_date;

        const dateStr = highDateStr ?? lowDateStr;

        const year = dateStr ? dateStr.split('-')[0] : '';
        return {
            fullDate: dateStr
                ? new Intl.DateTimeFormat('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                  }).format(new Date(dateStr))
                : '',
            year,
        };
    }

    renderStatusInfo(title) {
        return html`<span class="baseline-badge">${title}</span>`;
    }

    renderSupport(implementationId, support = 'unavailable') {
        const supportKey =
            support === 'newly' || support === 'widely' ? 'available' : support;

        return html`
            <span>
                ${ICONS[implementationId]}
                <browser-support-icon class="support-${support}">
                    ${SUPPORT_ICONS[supportKey]}
                </browser-support-icon>
            </span>
        `;
    }

    renderImplementationsInfo(supportStatus, implementations) {
        const { chrome, edge, firefox, safari } = implementations;

        return html`
            <div class="browsers">
                ${this.renderSupport(
                    'chrome',
                    supportStatus === 'limited'
                        ? chrome?.status
                        : supportStatus,
                )}
                ${this.renderSupport(
                    'edge',
                    supportStatus === 'limited' ? edge?.status : supportStatus,
                )}
                ${this.renderSupport(
                    'firefox',
                    supportStatus === 'limited'
                        ? firefox?.status
                        : supportStatus,
                )}
                ${this.renderSupport(
                    'safari',
                    supportStatus === 'limited'
                        ? safari?.status
                        : supportStatus,
                )}
            </div>
        `;
    }

    renderDescription(supportStatus, baselineDate, featureId) {
        const description = this.getDescription(supportStatus, baselineDate);

        return html`
            <p>${description}</p>
            <p>
                ${supportStatus === 'no_data'
                    ? ''
                    : html`<a
                          href="https://web-platform-dx.github.io/web-features-explorer/features/${featureId}/"
                          target="_top"
                          >Learn more</a
                      >`}
            </p>
        `;
    }
    renderTemplate(featureData) {
        const {
            name,
            baseline,
            browser_implementations: implementations = {},
            feature_id: featureId,
        } = featureData;

        console.log(':', featureData);

        const supportStatus = baseline.status || 'no_data';

        // const preTitle = (baseline === 'limited' || baseline === 'no_data')
        //     ? ''
        //     : html`<strong>Baseline</strong> `;

        const title = messages[supportStatus].title;

        const baselineDate = this.getBaselineDate(baseline);

        // const getAriaLabel = (
        //     title,
        //     year,
        //     badge,
        //     chrome = 'no',
        //     edge = 'no',
        //     firefox = 'no',
        //     safari = 'no',
        // ) => {
        //     if (title === 'Unknown availability') {
        //     chrome = edge = firefox = safari = 'unknown';
        //     }
        //     return `Baseline: ${title}${year ? ` ${year}` : ''}${badge ? ` (newly available)` : ''}. Supported in Chrome: ${chrome === 'available' ? 'yes' : chrome}. Supported in Edge: ${edge === 'available' ? 'yes' : edge}. Supported in Firefox: ${firefox === 'available' ? 'yes' : firefox}. Supported in Safari: ${safari === 'available' ? 'yes' : safari}.`;
        // };

        //     <summary
        //     //   aria-label="${getAriaLabel(
        //     //     title,
        //     //     year,
        //     //     badge,
        //     //     chrome?.status,
        //     //     edge?.status,
        //     //     firefox?.status,
        //     //     safari?.status,
        //     //   )}"
        //     // >
        //       <div class="baseline-status-title" aria-hidden="true">
        //         <div>${preTitle} ${title} ${year} ${badge}</div>

        //       </div>
        //     </div>

        //     <span class="open-icon" aria-hidden="true">
        //       <svg xmlns="http://www.w3.org/2000/svg" width="11" height="7" viewBox="0 0 11 7" fill="none">
        //         <path d="M5.5 6.45356L0.25 1.20356L1.19063 0.262939L5.5 4.59419L9.80937 0.284814L10.75 1.22544L5.5 6.45356Z" fill="currentColor"/>
        //       </svg>
        //     </span>

        return html`
            <div class="name">${name}</div>
            <details>
                <summary>
                    <baseline-icon
                        support="${supportStatus}"
                        aria-hidden="true"
                    ></baseline-icon>
                    <div class="status" aria-hidden="true">
                        ${this.renderStatusInfo(title)}
                        ${this.renderImplementationsInfo(
                            supportStatus,
                            implementations,
                        )}
                    </div>
                </summary>
                ${this.renderDescription(
                    supportStatus,
                    baselineDate,
                    featureId,
                )}
            </details>
            <div></div>
        `;
    }

    render() {
        if (!this.groupId) {
            return null;
        }
        return this.fetchData.render({
            pending: () => null, // this.renderTemplate(missingFeature, true)
            complete: featureData => {
                if (!featureData || !featureData.baseline) {
                    return null; // this.renderTemplate(missingFeature);
                }
                return this.renderTemplate(featureData);
            },
            error: () => null, // this.renderTemplate(missingFeature),
        });
    }
}
