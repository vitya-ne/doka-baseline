import { html, css, LitElement } from 'lit';
import { Task } from '@lit/task';
// eslint-disable-next-line no-unused-vars
import BaselineIcon from '../libs/baseline-status/baseline-icon';
import { ICONS as BROWSER_ICONS } from '../libs/baseline-status/browser-icons';
import { SUPPORT_ICONS } from '../libs/baseline-status/support-icons';
import { transformToBaselineObject } from './Utils';

export class DokaBaseline extends LitElement {
    static get styles() {
        return css`
            :host {
                --doka-baseline-color-limited: light-dark(#ea8600, #f09418);
                --doka-baseline-color-newly: light-dark(#1a73e8, #1b6ef3);
                --doka-baseline-color-widely: light-dark(#1e8e3e, #1ea446);
                --doka-baseline-color-no_data: light-dark(#707070, #909090);

                --doka-baseline-bgcolor-limited: light-dark(
                    #ea860024,
                    #f0941812
                );
                --doka-baseline-bgcolor-newly: light-dark(#1a73e824, #1b6ef312);
                --doka-baseline-bgcolor-widely: light-dark(
                    #1e8e3e24,
                    #1ea44612
                );

                --doka-baseline-color-border: light-dark(#d9d9d9, #808080);

                display: block;
                max-width: 1200px;
            }

            .doka-baseline {
                padding: 0 16px;
                font-family: inherit;
                font-size: 14px;
                font-style: normal;
                border-radius: 8px;
            }

            .doka-baseline.with-name {
                padding-top: 4px;
                padding-bottom: 4px;
            }

            .doka-baseline.limited {
                background: var(--doka-baseline-bgcolor-limited);

                .badge {
                    background: var(--doka-baseline-color-limited);
                }
            }

            .doka-baseline.newly {
                background: var(--doka-baseline-bgcolor-newly);

                .badge {
                    background: var(--doka-baseline-color-newly);
                }
            }

            .doka-baseline.widely {
                background: var(--doka-baseline-bgcolor-widely);

                .badge {
                    background: var(--doka-baseline-color-widely);
                }
            }

            .doka-baseline.no_data {
                .badge {
                    background: var(--doka-baseline-color-no_data);
                }
                border: solid 1px var(--doka-baseline-color-border);
            }

            // a,
            // a:active,
            // a:visited {
            //     color: var(--baseline-status-color-link);
            // }

            .name {
                font-weight: normal;
                font-size: 20px;
                margin: 0;
                padding-top: 8px;
            }

            .status-container {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                flex: 1;
                gap: 1rem;
            }

            .status-title {
                display: flex;
                align-items: center;
                white-space: nowrap;
                gap: 0.5rem;
                font-weight: bold;
            }

            .badge {
                padding: 0 0.5rem;
                line-height: 2;
                text-transform: uppercase;
                font-size: 12px;
                border-radius: 4px;
                color: #fff;
            }

            .browsers {
                display: flex;
                gap: 16px;
                max-width: 200px;
                font-size: 0;
            }

            .browsers .browser-support {
                white-space: nowrap;
                position: relative;
            }

            .support-widely,
            .support-available {
                color: var(--doka-baseline-color-widely);
            }

            .browsers.newly {
                .support-available {
                    color: var(--doka-baseline-color-newly);
                }
            }

            .support-unavailable {
                color: var(--doka-baseline-color-limited);
            }

            .support-no_data {
                color: var(--doka-baseline-color-no_data);
            }

            .browser-version {
                visibility: hidden;
                position: absolute;
                width: 50%;
                text-align: center;
                font-size: 14px;
                font-weight: bold;
            }

            .doka-baseline:hover {
                .browser-version {
                    visibility: visible;
                }
            }

            summary {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                padding: 16px 0;
                cursor: pointer;
                font-size: 16px;
            }
        `;
    }

    static properties = {
        groupId: { type: String },
        showName: { type: String },
    };

    constructor() {
        super();
        this.groupId = '';
        this.showName = 'false';
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

    renderStatusTitle(baselineObj) {
        const { badge, dates, showYear } = baselineObj;
        return html`
            <div class="status-title">
                <span class="badge">${badge}</span>${showYear
                    ? `${dates.year}`
                    : ''}
            </div>
        `;
    }

    renderBrowserSupport(browser) {
        const { id, data } = browser;
        const { status = 'unavailable', version } = data;

        return html`
            <span class="browser-support">
                ${BROWSER_ICONS[id]}
                <browser-support-icon class="support-${status}">
                    ${SUPPORT_ICONS[status]}
                </browser-support-icon>
                ${version
                    ? html`<div class="browser-version">${version}</div>`
                    : ''}
            </span>
        `;
    }

    renderImplementationsInfo(baselineObj) {
        const { implementations, supportStatus } = baselineObj;

        return html`
            <div class="browsers ${supportStatus}">
                ${implementations.map(browser =>
                    this.renderBrowserSupport(browser),
                )}
            </div>
        `;
    }

    renderDescription(baselineObj) {
        const { supportStatus, description, id } = baselineObj;

        return html`
            <p>${description}</p>
            <p>
                ${supportStatus === 'no_data'
                    ? ''
                    : html`<a
                          href="https://web-platform-dx.github.io/web-features-explorer/features/${id}/"
                          target="_top"
                          >Learn more</a
                      >`}
            </p>
        `;
    }

    renderName(name) {
        if (this.showName === 'true') {
            return html`<div class="name">${name}</div>`;
        }
        return null;
    }

    renderBaseline(baselineObj) {
        if (baselineObj === null) {
            return null;
        }

        const { name, ariaLabel, supportStatus } = baselineObj;

        //     <span class="open-icon" aria-hidden="true">
        //       <svg xmlns="http://www.w3.org/2000/svg" width="11" height="7" viewBox="0 0 11 7" fill="none">
        //         <path d="M5.5 6.45356L0.25 1.20356L1.19063 0.262939L5.5 4.59419L9.80937 0.284814L10.75 1.22544L5.5 6.45356Z" fill="currentColor"/>
        //       </svg>
        //     </span>

        const mainClass = `doka-baseline ${supportStatus}${this.showName === 'true' ? ' with-name' : ''}`;

        return html`
            <div class=${mainClass}>
                ${this.renderName(name)}
                <details>
                    <summary aria-label="${ariaLabel}">
                        <baseline-icon
                            support="${supportStatus}"
                            aria-hidden="true"
                        ></baseline-icon>
                        <div class="status-container" aria-hidden="true">
                            ${this.renderStatusTitle(baselineObj)}
                            ${this.renderImplementationsInfo(baselineObj)}
                        </div>
                    </summary>
                    ${this.renderDescription(baselineObj)}
                </details>
                <div></div>
            </div>
        `;
    }

    render() {
        if (!this.groupId) {
            return null;
        }

        return this.fetchData.render({
            pending: () => null, // this.renderTemplate(missingFeature, true)
            complete: responseData => {
                const baselineObj = transformToBaselineObject(responseData);

                return this.renderBaseline(baselineObj);
            },
            error: () => {
                const emptyBaselineObj = transformToBaselineObject();
                return this.renderBaseline(emptyBaselineObj);
            },
        });
    }
}
