import { renderSensorImage, type SceneConfig, type SensorRenderResult } from "./opticsModel";

type SensorWorkerRequest = {
  id: number;
  config: SceneConfig;
};

type SensorWorkerResponse = {
  id: number;
  result: SensorRenderResult;
};

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<SensorWorkerRequest>) => void) | null;
  postMessage: (message: SensorWorkerResponse, transfer: Transferable[]) => void;
};

function transferBuffers(result: SensorRenderResult): Transferable[] {
  return [
    result.pixelBuffer.buffer,
    result.learningBuffer.buffer,
    result.sampleBuffer.buffer,
    result.debugBuffer.buffer,
  ].filter((buffer, index, buffers) => buffers.indexOf(buffer) === index);
}

workerScope.onmessage = (event: MessageEvent<SensorWorkerRequest>) => {
  const { id, config } = event.data;
  const result = renderSensorImage(config);
  const response: SensorWorkerResponse = { id, result };
  workerScope.postMessage(response, transferBuffers(result));
};
