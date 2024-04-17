import { llamaindex as li, modulesPromise } from '../modules.js';
/* eslint-disable-next-line  @typescript-eslint/ban-ts-comment */
// @ts-ignore: this is just for type anyway and for some it produces error if baserun is installed as esm
import { CallbackManager } from 'llamaindex';
import { baserun } from '../../index.js';

export async function initLlamaIndex() {
  await modulesPromise;
  for (const mod of li) {
    (mod.Settings.callbackManager as CallbackManager).on(
      'retrieve',
      (event) => {
        baserun.log('Query for nodes retrieval', event.detail.query);
        baserun.log('Selected nodes', event.detail.nodes);
      },
    );
  }
}
