import { AppEvent } from '../core';
import { IResultSetQuery, Result } from './common';

const plot = ($ as any).plot;

class ChartEvents {
  resultHoverEvent: AppEvent<{ pageX: number; pageY: number; result: Result; resultSet: IResultSetQuery }>;
  resultHoverEndEvent: AppEvent<void>;
  errorEvent: AppEvent<unknown>;
  startLoadingDataEvent: AppEvent<void>;
  endLoadingDataEvent: AppEvent<void>;
  constructor() {
    this.resultHoverEvent = new AppEvent();
    this.resultHoverEndEvent = new AppEvent();
    this.errorEvent = new AppEvent();
    this.startLoadingDataEvent = new AppEvent();
    this.endLoadingDataEvent = new AppEvent();
  }
}

export class Chart extends ChartEvents implements IChart {
  #chartsDivJqueryObj: JQuery<any>;
  #currentGraphData: IGraphData;
  #flotOptions: IFlotOptions;
  #resultSets: IResultSetQuery[];
  #initialExtent: { minx: number; miny: number; maxx: number; maxy: number };
  #halfWidthIfOneResult_Milliseconds: number;
  #margin_Percentage: number;
  constructor(
    chartsDivId: string,
    _legendDivId?: string | null,
    _margin_Percentage?: number,
    _halfWidthIfOneResult_Milliseconds?: number,
  ) {
    super();
    const legendDivId = _legendDivId ?? null;
    this.#margin_Percentage = _margin_Percentage ?? 10;
    /***
     * Default half width is half a year
     */
    this.#halfWidthIfOneResult_Milliseconds = _halfWidthIfOneResult_Milliseconds ?? 0.5 * 365 * 24 * 60 * 60 * 1000;

    this.#resultSets = [];
    this.#currentGraphData = [];
    this.#initialExtent = { minx: 0, miny: 0, maxx: 0, maxy: 0 };
    const hasLegendContainer = legendDivId != null;
    this.#resetInitialExtent();
    this.#flotOptions = {
      legend: {
        position: hasLegendContainer ? 'nw' : 'sw',
        show: true,
        container: legendDivId != null ? '#' + legendDivId : null,
      },
      series: {
        lines: {
          show: false,
        },
      },
      grid: {
        hoverable: true,
        /*clickable: true*/
      },
      xaxis: {
        mode: 'time',
        timezone: 'browser',
        min: this.#initialExtent.minx,
        max: this.#initialExtent.maxx,
      },
      yaxis: {
        min: this.#initialExtent.miny,
        max: this.#initialExtent.maxy,
      },
      zoom: {
        interactive: true,
      },
      pan: {
        interactive: true,
      },
      selection: {
        mode: null,
      },
    };
    this.#chartsDivJqueryObj = $('#' + chartsDivId);

    plot(this.#chartsDivJqueryObj, this.#currentGraphData, this.#flotOptions);

    this.#chartsDivJqueryObj.bind('plotselected', this.#handlePlotSelected.bind(this));

    this.#chartsDivJqueryObj.bind('plotpan', (event: any, plot: { getAxes: () => any }) => {
      const axes = plot.getAxes();
      this.#flotOptions.xaxis.max = axes.xaxis.max;
      this.#flotOptions.xaxis.min = axes.xaxis.min;
      this.#flotOptions.yaxis.max = axes.yaxis.max;
      this.#flotOptions.yaxis.min = axes.yaxis.min;
    });

    this.#chartsDivJqueryObj.bind('plotzoom', (event: any, plot: { getAxes: () => any }) => {
      const axes = plot.getAxes();
      this.#flotOptions.xaxis.max = axes.xaxis.max;
      this.#flotOptions.xaxis.min = axes.xaxis.min;
      this.#flotOptions.yaxis.max = axes.yaxis.max;
      this.#flotOptions.yaxis.min = axes.yaxis.min;
    });

    this.#chartsDivJqueryObj.bind('plothover', this.#handlePlotHover.bind(this));
  }

  #handlePlotSelected(
    event: any,
    ranges: { yaxis: { from: number; to: number }; xaxis: { from: number; to: number } },
  ) {
    this.#flotOptions.yaxis.min = ranges.yaxis.from;
    this.#flotOptions.yaxis.max = ranges.yaxis.to;
    this.#flotOptions.xaxis.min = ranges.xaxis.from;
    this.#flotOptions.xaxis.max = ranges.xaxis.to;
    this.#updateGraph();
  }

  #handlePlotHover(event: any, pos: any, item: { seriesIndex: any; pageX: any; pageY: any; dataIndex: any }) {
    if (item) {
      const resultSetIndex = item.seriesIndex;
      const pageX = item.pageX;
      const pageY = item.pageY;
      const resultIndex = item.dataIndex;
      const resultSet = this.#resultSets[resultSetIndex];
      const result = resultSet.getData()![resultIndex];
      this.resultHoverEvent.trigger({ pageX: pageX, pageY: pageY, result: result, resultSet: resultSet });
    } else {
      this.resultHoverEndEvent.trigger();
    }
  }

  #updateGraph() {
    plot(this.#chartsDivJqueryObj, this.#currentGraphData, $.extend(true, {}, this.#flotOptions, {}));
  }

  #addResultSetAndRender(resultSet: IResultSetQuery) {
    this.#resultSets.push(resultSet);
    this.#renderResultSets();
  }

  #resetInitialExtent() {
    this.#initialExtent = {
      minx: Number.MAX_VALUE,
      miny: Number.MAX_VALUE,
      maxx: -Number.MAX_VALUE,
      maxy: -Number.MAX_VALUE,
    };
  }

  #renderResultSets() {
    this.#resetInitialExtent();

    this.#currentGraphData = [];

    const colorByResultSetIndex = generateCSSColorStrings(this.#resultSets.length);
    for (const i in this.#resultSets) {
      const resultSet = this.#resultSets[i];
      const color = colorByResultSetIndex[i];

      const results = resultSet.getData()!;
      const resultsArrays = [];
      for (const j in results) resultsArrays.push(results[j].toFlotArray());

      this.#currentGraphData.push({
        color: color,
        points: {
          show: true,
          radius: 5,
          fillColor: color,
          errorbars: 'y',
          xerr: {
            show: false,
          },
          yerr: {
            show: true,
            color: 'violet',
            upperCap: '-',
            lowerCap: '-',
          },
        },
        data: resultsArrays,
        label: resultSet.getLabel(),
      });

      for (const k in resultsArrays) {
        const x = resultsArrays[k][0]!;
        const y = resultsArrays[k][1]!;
        const u = resultsArrays[k][2]!;

        if (x < this.#initialExtent.minx) {
          this.#initialExtent.minx = x;
        }
        if (y - u < this.#initialExtent.miny) {
          this.#initialExtent.miny = y - u;
        }
        if (x > this.#initialExtent.maxx) {
          this.#initialExtent.maxx = x;
        }
        if (y + u > this.#initialExtent.maxy) {
          this.#initialExtent.maxy = y + u;
        }
      }
    }

    const width = this.#initialExtent.maxx - this.#initialExtent.minx;
    if (width === 0) {
      this.#initialExtent.minx -= this.#halfWidthIfOneResult_Milliseconds;
      this.#initialExtent.maxx += this.#halfWidthIfOneResult_Milliseconds;
    } else {
      const marginX = 0.01 * this.#margin_Percentage * width;
      this.#initialExtent.minx -= marginX;
      this.#initialExtent.maxx += marginX;
    }
    let height = this.#initialExtent.maxy - this.#initialExtent.miny;
    if (height === 0) {
      if (this.#initialExtent.miny > 0) {
        this.#initialExtent.miny = 0;
      } else {
        this.#initialExtent.maxy = 0;
      }
      height = this.#initialExtent.maxy - this.#initialExtent.miny;
    }
    const marginY = 0.01 * this.#margin_Percentage * height;
    this.#initialExtent.miny -= marginY;
    this.#initialExtent.maxy += marginY;

    this.#flotOptions.yaxis.min = this.#initialExtent.miny;
    this.#flotOptions.yaxis.max = this.#initialExtent.maxy;
    this.#flotOptions.xaxis.min = this.#initialExtent.minx;
    this.#flotOptions.xaxis.max = this.#initialExtent.maxx;

    this.#updateGraph();
  }

  #resultSetSearch_Callback(resultSet: IResultSetQuery) {
    this.endLoadingDataEvent.trigger();

    if (resultSet.getError() === null) {
      this.#addResultSetAndRender(resultSet);
    } else {
      this.errorEvent.trigger(resultSet.getError());
    }
  }

  addResultSet(resultSet: IResultSetQuery) {
    if (!resultSet.isResultSearchReady()) {
      this.startLoadingDataEvent.trigger();
      resultSet.execute(this.#resultSetSearch_Callback.bind(this));
    } else {
      this.#addResultSetAndRender(resultSet);
    }
  }

  hasResultSet(resultSet: { getLabel: () => string }) {
    for (const i in this.#resultSets)
      if (resultSet.getLabel() === this.#resultSets[i].getLabel()) {
        return true;
      }

    return false;
  }

  hasAnyResultSet() {
    return this.#resultSets.length > 0;
  }

  removeResultSet(resultSet: IResultSetQuery) {
    const index = this.#resultSets.indexOf(resultSet);
    if (index === -1) {
      return;
    }
    this.#resultSets.splice(index, 1);
    this.#renderResultSets();
  }

  setSelectionZoom() {
    this.#flotOptions.zoom.interactive = false;
    this.#flotOptions.pan.interactive = false;
    this.#flotOptions.selection.mode = 'xy';
    this.#updateGraph();
  }

  setMouseScrollZoom() {
    this.#flotOptions.zoom.interactive = true;
    this.#flotOptions.pan.interactive = true;
    this.#flotOptions.selection.mode = null;
    this.#updateGraph();
  }

  setInitialExtent() {
    this.#flotOptions.yaxis.min = this.#initialExtent.miny;
    this.#flotOptions.yaxis.max = this.#initialExtent.maxy;
    this.#flotOptions.xaxis.min = this.#initialExtent.minx;
    this.#flotOptions.xaxis.max = this.#initialExtent.maxx;
    this.#updateGraph();
  }
}

function generateCSSColorStrings(num_colors: number) {
  const colorStrings = [];
  //https://stackoverflow.com/a/470747
  for (let i = 0; i < 360; i += 360 / num_colors) {
    const hue = i;
    const sat = 90 + Math.random() * 10;
    const light = 50 + Math.random() * 10;
    colorStrings.push('hsl(' + hue + ',' + sat + '%,' + light + '%)');
  }

  return colorStrings;
}

export type IChart = {
  hasAnyResultSet(): boolean;
  resultHoverEvent: AppEvent<{ pageX: number; pageY: number; result: Result; resultSet: IResultSetQuery }>;
  resultHoverEndEvent: AppEvent<void>;
  errorEvent: AppEvent<unknown>;
  startLoadingDataEvent: AppEvent<void>;
  endLoadingDataEvent: AppEvent<void>;

  addResultSet: (resultSet: IResultSetQuery) => void;
  hasResultSet: (resultSet: IResultSetQuery) => boolean;
  removeResultSet: (resultSet: IResultSetQuery) => void;
  setSelectionZoom: () => void;
  setMouseScrollZoom: () => void;
  setInitialExtent: () => void;
};

type IGraphData = {
  color: string;
  points: {
    show: boolean;
    radius: number;
    fillColor: string;
    errorbars: string;
    xerr: { show: boolean };
    yerr: { show: boolean; color: string; upperCap: string; lowerCap: string };
  };
  data: (number | null)[][];
  label: string;
}[];

type IFlotOptions = {
  legend: {
    position: 'nw' | 'sw';
    show: boolean;
    container: string | null;
  };
  series: {
    lines: {
      show: boolean;
    };
  };
  grid: {
    hoverable: boolean;
  };
  xaxis: {
    mode: 'time';
    timezone: 'browser';
    min: number;
    max: number;
  };
  yaxis: {
    min: number;
    max: number;
  };
  zoom: {
    interactive: boolean;
  };
  pan: {
    interactive: boolean;
  };
  selection: {
    mode: null | 'xy';
  };
};
