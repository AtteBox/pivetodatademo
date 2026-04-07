import { renderTemplate } from './common';
import layersNotSeenInfo from './templates/layersNotSeenInfo.hbs';

const window = globalThis as any;
const document = window.document;

export class MapUI {
  #numOfLayersLoading: number;
  #numOfPopupStuffLoading: number;
  #popupWindowIsOpen: boolean;
  #layerNamesNotSeen: string[];
  #popupSize: { width: number; height: number };
  constructor() {
    this.#numOfLayersLoading = 0;
    this.#numOfPopupStuffLoading = 0;
    this.#popupWindowIsOpen = false;
    this.#layerNamesNotSeen = [];
    this.#popupSize = evalPopupSize();

    $('#map-loader').hide();
    $('#popup-window').hide();
    $('#popup-window-loader').hide();

    window.onresize = () => {
      this.#popupSize = evalPopupSize();
    };
  }

  #renderLayersNotSeen() {
    if (this.#layerNamesNotSeen.length == 0) {
      $('#map-layers-not-seen-message').hide();
    } else {
      if (this.#layerNamesNotSeen.length == 1) $('#map-layers-not-seen-message').show();

      const html = renderTemplate(layersNotSeenInfo, { layerNamesNotSeen: this.#layerNamesNotSeen });
      $('#map-layers-not-seen-message').html(html);
    }
  }

  startLayerNotSeenIndicator(layerName: string) {
    const alreadyInList = this.#layerNamesNotSeen.includes(layerName);
    if (!alreadyInList) {
      this.#layerNamesNotSeen.push(layerName);
      this.#renderLayersNotSeen();
    }
  }

  endLayerNotSeenIndicator(layerName: any) {
    const alreadyInList = this.#layerNamesNotSeen.includes(layerName);
    if (alreadyInList) {
      this.#layerNamesNotSeen.splice(this.#layerNamesNotSeen.indexOf(layerName), 1);
      this.#renderLayersNotSeen();
    }
  }

  startLoadingIndicator() {
    this.#numOfLayersLoading++;
    if (this.#numOfLayersLoading === 1) {
      $('#map-loader').fadeIn(200);
    }
  }

  endLoadingIndicator() {
    this.#numOfLayersLoading--;
    if (this.#numOfLayersLoading === 0) {
      $('#map-loader').fadeOut(200);
    }
  }

  startPopupLoadingIndicator() {
    this.#numOfPopupStuffLoading++;
    if (this.#numOfPopupStuffLoading == 1) {
      $('#popup-window-loader').fadeIn(200);
    }
  }

  endPopupLoadingIndicator() {
    this.#numOfPopupStuffLoading--;
    if (this.#numOfPopupStuffLoading == 0) {
      $('#popup-window-loader').fadeOut(200);
    }
  }

  getPopupSize() {
    return this.#popupSize;
  }

  showPopupWindow(contents: string) {
    if (!this.#popupWindowIsOpen) {
      $('#popup-window-content').html(contents);
      $('#popup-window').fadeIn(200);
    }
  }

  hidePopupWindow() {
    $('#popup-window').fadeOut(200);
    this.#numOfPopupStuffLoading = 0;
  }

  showAppErrMsg() {
    $('#error-window').fadeIn(200);
  }
}

export type IMapUI = {
  getPopupSize: () => any;
  showPopupWindow: (html: string) => void;
  hidePopupWindow: () => void;
  startPopupLoadingIndicator: () => void;
  endPopupLoadingIndicator: () => void;
  showAppErrMsg: () => void;
  startLayerNotSeenIndicator: (layerName: string) => void;
  endLoadingIndicator: () => void;
  startLoadingIndicator: () => void;
  endLayerNotSeenIndicator: (layerName: string) => void;
};

function evalPopupSize() {
  const margin = 30; //px
  const minWidth = 200;
  const minHeight = 400;
  const w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  const h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  const popupWidth = Math.max(w - 2 * margin, minWidth);
  const popupHeight = Math.max(h - 2 * margin, minHeight);
  return { width: popupWidth, height: popupHeight };
}
