import { Baserun } from '../baserun.js';

export default async function baserunSetup() {
  Baserun.forceTestEnv = true;
  await Baserun.init();
}
