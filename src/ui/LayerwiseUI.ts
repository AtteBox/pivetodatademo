import $ from 'jquery';

import { AppEvent } from '../core';
import { Chart, IResultSetQuery, Result } from '../chart';
import { renderTemplate } from './common';
import { ISiteInfo } from '../siteInfo';
import { IMapUI } from './MapUI';
import siteInfo from './templates/siteInfo.hbs';
import resultCharts from './templates/resultCharts.hbs';
import resultTooltip from './templates/resultTooltip.hbs';
import resultsetChoice from './templates/resultsetChoice.hbs';
import resultsetTooltip from './templates/resultsetTooltip.hbs';

const window = globalThis as any;
const document = window.document;

type ITextResourceMapping = {
  [key: string]: string;
};

class LayerwiseUIEvents {
  navigateToResultsEvent: AppEvent<void>;
  navigateToSiteInfoEvent: AppEvent<void>;
  errorEvent: AppEvent<unknown>;

  constructor() {
    this.navigateToResultsEvent = new AppEvent();
    this.navigateToSiteInfoEvent = new AppEvent();
    this.errorEvent = new AppEvent();
  }
}

export class LayerwiseUI extends LayerwiseUIEvents {
  #siteAttributeNameToUIName: ITextResourceMapping;
  #showNotUiNamedAttributes: boolean;
  #mapUI: IMapUI;
  #resultAttributeNameToUIName: ITextResourceMapping;
  #resultSetAttributeNameToUIName: ITextResourceMapping;
  constructor(
    mapUI: IMapUI,
    siteAttributeNameToUIName: ITextResourceMapping,
    resultSetAttributeNameToUIName: ITextResourceMapping,
    resultAttributeNameToUIName: ITextResourceMapping,
    showNotUiNamedAttributes: boolean,
  ) {
    super();

    this.#siteAttributeNameToUIName = siteAttributeNameToUIName;
    this.#showNotUiNamedAttributes = showNotUiNamedAttributes;
    this.#resultAttributeNameToUIName = resultAttributeNameToUIName;
    this.#resultSetAttributeNameToUIName = resultSetAttributeNameToUIName;
    this.#mapUI = mapUI;
  }

  #showTooltip(x: number, y: number, html: string) {
    const tooltipJQElem = $('#tooltip');
    const winWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const winHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const margin = 15; //px

    tooltipJQElem
      .html(html)
      .css({
        top: 0,
        left: 0,
        maxWidth: Math.min(winWidth - 2 * margin, 320) + 'px',
      })
      .show();
    const renderedTtHeight = Number(tooltipJQElem.css('height').replace('px', ''));
    const renderedTtWidth = Number(tooltipJQElem.css('width').replace('px', ''));

    let ttPosX = x + margin;
    let ttPosY = y + margin;

    if (ttPosX + renderedTtWidth + margin > winWidth) {
      ttPosX = x - renderedTtWidth - margin;
    }
    ttPosX = Math.max(margin, Math.min(ttPosX, winWidth - renderedTtWidth - margin));

    if (ttPosY + renderedTtHeight + margin > winHeight) {
      ttPosY = y - renderedTtHeight - margin;
    }
    ttPosY = Math.max(margin, Math.min(ttPosY, winHeight - renderedTtHeight - margin));

    tooltipJQElem.css({
      top: ttPosY + 'px',
      left: ttPosX + 'px',
    });
  }

  #hideTooltip() {
    $('#tooltip').hide();
  }

  #handleResultHover(resultHoverInfo: { pageX: number; pageY: number; result: Result; resultSet: IResultSetQuery }) {
    const result = resultHoverInfo.result;
    const otherAttributes = objectPropertiesToNameValueArray(
      result.getAddInfo(),
      this.#resultAttributeNameToUIName,
      this.#showNotUiNamedAttributes,
    );
    const html = renderTemplate(resultTooltip, {
      otherAttributes: otherAttributes,
      date: result.getDate(),
      value: result.getValue(),
      measUnc: result.getMeasUnc(),
      resultSetLabel: resultHoverInfo.resultSet.getLabel(),
      unit: result.getUnit(),
    });
    this.#showTooltip(resultHoverInfo.pageX, resultHoverInfo.pageY, html);
  }

  #handleResultSetHover(event: any, resultSets: IResultSetQuery[]) {
    const index = parseInt(event.target.id.replace('charts-result-set-button_', ''));
    const resultSet = resultSets[index];
    const otherAttributes = objectPropertiesToNameValueArray(
      resultSet.getInfoObj(),
      this.#resultSetAttributeNameToUIName,
      this.#showNotUiNamedAttributes,
    );
    const html = renderTemplate(resultsetTooltip, { otherAttributes: otherAttributes });
    this.#showTooltip(event.pageX, event.pageY, html);
  }

  showSiteInfo(siteObject: any) {
    const attributes = objectPropertiesToNameValueArray(
      siteObject,
      this.#siteAttributeNameToUIName,
      this.#showNotUiNamedAttributes,
    );
    const html = renderTemplate(siteInfo, { siteAttributes: attributes });

    this.#mapUI.showPopupWindow(html);
    $('#popup-window-hide-button').click(() => {
      this.#mapUI.hidePopupWindow();
    });
    $('#site-info-menu-show-results').click(() => {
      this.navigateToResultsEvent.trigger();
    });
  }

  showResults(resultSets: IResultSetQuery[]) {
    const popupWindowSize = this.#mapUI.getPopupSize();

    const containerHeight = window.innerHeight * 0.87;
    let chartHeight = containerHeight - 200;
    let isSmallScreen = false;
    if (popupWindowSize.width < 700) {
      isSmallScreen = true;
      chartHeight *= 0.5;
    }
    const html = renderTemplate(resultCharts, {
      chartHeight,
    });
    this.#mapUI.showPopupWindow(html);

    const charts = new Chart('flot-charts-placeholder', 'flot-charts-legend-placeholder');
    charts.errorEvent.addListener((err) => this.errorEvent.trigger(err));
    charts.startLoadingDataEvent.addListener(this.#mapUI.startPopupLoadingIndicator.bind(this.#mapUI));
    charts.endLoadingDataEvent.addListener(this.#mapUI.endPopupLoadingIndicator.bind(this.#mapUI));
    charts.resultHoverEvent.addListener(this.#handleResultHover.bind(this));

    charts.resultHoverEndEvent.addListener(this.#hideTooltip.bind(this));

    for (const i in resultSets) {
      const resultSet = resultSets[i];
      const label = resultSet.getLabel();
      const buttonElemId = 'charts-result-set-button_' + i;
      $('#charts-result-set-choices').append(
        renderTemplate(resultsetChoice, {
          label: label,
          buttonElemId: buttonElemId,
        }),
      );
      $('#' + buttonElemId).click((event) => {
        const index = parseInt(event.target.id.replace('charts-result-set-button_', ''));
        const rs = resultSets[index];
        const gotSelected = !charts.hasResultSet(rs);
        if (gotSelected) {
          charts.addResultSet(rs);
          event.target.attributes['data-selected'].value = 'true';
          event.target.attributes['aria-selected'].value = 'true';
        } else {
          charts.removeResultSet(rs);
          event.target.attributes['data-selected'].value = 'false';
          event.target.attributes['aria-selected'].value = 'false';
        }

        if (gotSelected || charts.hasAnyResultSet()) {
          $('#no-selected-result-set-message').hide();
        } else {
          $('#no-selected-result-set-message').show();
        }
      });
      if (!isSmallScreen) {
        // hover on items only if large screen
        $('#' + buttonElemId).hover(
          (event) => {
            this.#handleResultSetHover.bind(this)(event, resultSets);
          },
          () => {
            this.#hideTooltip();
          },
        );
      }
    }

    $('#popup-window-hide-button').click(() => {
      this.#mapUI.hidePopupWindow();
    });
    $('input[name=charts-way-to-zoom]:radio').change(() => {
      if ($('input[name=charts-way-to-zoom]:checked').val() == 'selection') {
        charts.setSelectionZoom();
      } else {
        charts.setMouseScrollZoom();
      }
    });

    $('#charts-initial-extent-button').click(() => {
      charts.setInitialExtent();
    });
    $('#site-info-menu-show-site-info').click(() => {
      this.navigateToSiteInfoEvent.trigger();
    });
  }
}

export type ILayerWiseUI = {
  showSiteInfo: (siteObject: ISiteInfo) => void;
  showResults: (resultSets: IResultSetQuery[]) => void;
  navigateToSiteInfoEvent: AppEvent<void>;
  navigateToResultsEvent: AppEvent<void>;
  errorEvent: AppEvent<unknown>;
};

function objectPropertiesToNameValueArray(
  obj: { [x: string]: any },
  keyToNameMapping: { [x: string]: any },
  includeNotMappedKeys: boolean,
) {
  const array: { name: any; value: string | number }[] = [];
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      if (keyToNameMapping[key]) {
        array.push({ name: keyToNameMapping[key], value: value });
      } else if (includeNotMappedKeys) {
        array.push({ name: key, value: value });
      }
    }
  });
  return array;
}
