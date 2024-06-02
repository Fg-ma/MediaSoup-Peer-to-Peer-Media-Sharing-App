import { Worker, Router } from "mediasoup/node/lib/types";
import createWorker from "./createWorker";
import { config } from "../config";

const workers: Array<{ worker: Worker; router: Router }> = [];
let nextMediasoupWorkerIdx = 0;

const initializeWorkers = async () => {
  const numWorkers = config.mediasoup.numWorkers;

  for (let i = 0; i < numWorkers; i++) {
    const mediasoupWorker = await createWorker();
    workers.push(mediasoupWorker);
    console.log(`Worker ${i} initialized:`, mediasoupWorker);
  }
};

const getNextWorker = () => {
  const worker = workers[nextMediasoupWorkerIdx];
  console.log(`Selected worker index: ${nextMediasoupWorkerIdx}`);
  const fullWorker = { ...worker, workerIdx: nextMediasoupWorkerIdx };
  nextMediasoupWorkerIdx = (nextMediasoupWorkerIdx + 1) % workers.length;
  return fullWorker;
};

const getWorkerByIdx = (idx: number) => {
  return workers[idx];
};

export { initializeWorkers, getNextWorker, getWorkerByIdx };
