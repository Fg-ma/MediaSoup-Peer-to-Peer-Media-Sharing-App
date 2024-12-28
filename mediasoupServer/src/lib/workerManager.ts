import * as mediasoup from "mediasoup";
import { Worker, Router } from "mediasoup/node/lib/types";
import { config } from "../config";
import { workers } from "./mediasoupVars";

// Initialize as many workers as there are number of cpus
const initializeWorkers = async () => {
  const numWorkers = config.mediasoup.numWorkers;

  for (let i = 0; i < numWorkers; i++) {
    const { worker, router } = await createWorker();
    workers.push({ worker, router, activeConnections: 0 });
  }
};

const createWorker = async (): Promise<{ worker: Worker; router: Router }> => {
  const worker = await mediasoup.createWorker({
    logLevel: config.mediasoup.worker.logLevel,
    logTags: config.mediasoup.worker.logTags,
    rtcMinPort: config.mediasoup.worker.rtcMinPort,
    rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
  });

  worker.on("died", () => {
    console.error(
      "mediasoup worker died, exiting in 2 seconds ... [pid:&d]",
      worker.pid
    );
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  });

  const mediaCodecs = config.mediasoup.router.mediaCodes;
  const router = await worker.createRouter({ mediaCodecs });

  return { worker, router };
};

// Least connections load balancing
const getNextWorker = () => {
  let leastConnectionsIdx = 0;

  for (let i = 1; i < workers.length; i++) {
    if (
      workers[i].activeConnections <
      workers[leastConnectionsIdx].activeConnections
    ) {
      leastConnectionsIdx = i;
    }
  }

  const selectedWorker = workers[leastConnectionsIdx];
  selectedWorker.activeConnections += 1;
  return { ...selectedWorker, workerIdx: leastConnectionsIdx };
};

// Decrement active connections count when a connection is closed
const releaseWorker = (workerIdx: number) => {
  if (workers[workerIdx]) {
    workers[workerIdx].activeConnections -= 1;
  }
};

const getWorkerByIdx = (idx: number) => {
  return workers[idx];
};

export { initializeWorkers, getNextWorker, getWorkerByIdx, releaseWorker };
