import * as dat from 'dat.gui';

export const controlPanel = new dat.GUI();
controlPanel.useLocalStorage = true;

controlPanel.addFolder('click to spawn a dynamic box');
controlPanel.addFolder('ctrl + click to spawn a static box');
controlPanel.addFolder('shift + click to spawn particles');
