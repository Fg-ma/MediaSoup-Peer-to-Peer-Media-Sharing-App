import {
  DataStreamTypes,
  tableConsumers,
  tableConsumerTransports,
  tableProducers,
  tableProducerTransports,
  workersMap,
  ProducerTypes,
} from "../typeConstant";
import { releaseWorker } from "./workerManager";

class MediasoupCleanup {
  constructor() {}

  clearTableConsumers(
    tableId: string,
    username: string,
    instance?: string,
    producerUsername?: string,
    producerInstance?: string,
    producerType?: ProducerTypes
  ) {
    if (
      instance &&
      producerUsername &&
      producerInstance &&
      producerType &&
      Object.keys(
        tableConsumers[tableId][username][instance][producerUsername][
          producerInstance
        ][producerType] || {
          break: true,
        }
      ).length === 0
    ) {
      delete tableConsumers[tableId][username][instance][producerUsername][
        producerInstance
      ][producerType];
    }

    if (
      instance &&
      producerUsername &&
      producerInstance &&
      Object.keys(
        tableConsumers[tableId][username][instance][producerUsername][
          producerInstance
        ] || {
          break: true,
        }
      ).length === 0
    ) {
      delete tableConsumers[tableId][username][instance][producerUsername][
        producerInstance
      ];
    }

    if (
      instance &&
      producerUsername &&
      Object.keys(
        tableConsumers[tableId][username][instance][producerUsername] || {
          break: true,
        }
      ).length === 0
    ) {
      delete tableConsumers[tableId][username][instance][producerUsername];
    }

    if (
      instance &&
      Object.keys(
        tableConsumers[tableId][username][instance] || {
          break: true,
        }
      ).length === 0
    ) {
      delete tableConsumers[tableId][username][instance];
    }

    if (
      Object.keys(
        tableConsumers[tableId][username] || {
          break: true,
        }
      ).length === 0
    ) {
      delete tableConsumers[tableId][username];

      if (
        Object.keys(
          tableConsumers[tableId] || {
            break: true,
          }
        ).length === 0
      ) {
        delete tableConsumers[tableId];
      }
    }
  }

  clearTableProducers(
    tableId: string,
    username: string,
    instance: string,
    producerType?: ProducerTypes
  ) {
    if (
      producerType &&
      Object.keys(
        tableProducers[tableId][username][instance][producerType] || {
          break: true,
        }
      ).length === 0
    ) {
      delete tableProducers[tableId][username][instance][producerType];
    }

    if (
      Object.keys(
        tableProducers[tableId][username][instance] || {
          break: true,
        }
      ).length === 0
    ) {
      delete tableProducers[tableId][username][instance];
    }

    if (
      Object.keys(
        tableProducers[tableId][username] || {
          break: true,
        }
      ).length === 0
    ) {
      delete tableProducers[tableId][username];

      if (
        Object.keys(
          tableProducers[tableId] || {
            break: true,
          }
        ).length === 0
      ) {
        delete tableProducers[tableId];
      }
    }
  }

  deleteProducerTransports(
    tableId: string,
    username: string,
    instance: string
  ) {
    if (
      tableProducerTransports[tableId] &&
      tableProducerTransports[tableId][username] &&
      tableProducerTransports[tableId][username][instance]
    ) {
      tableProducerTransports[tableId][username][instance].transport.close();
      delete tableProducerTransports[tableId][username][instance];

      if (
        Object.keys(
          tableProducerTransports[tableId][username] || {
            break: true,
          }
        ).length === 0
      ) {
        delete tableProducerTransports[tableId][username];

        if (
          Object.keys(tableProducerTransports[tableId] || { break: true })
            .length === 0
        ) {
          delete tableProducerTransports[tableId];
        }
      }
    }
  }

  deleteConsumerTransport(tableId: string, username: string, instance: string) {
    if (
      tableConsumerTransports[tableId] &&
      tableConsumerTransports[tableId][username] &&
      tableConsumerTransports[tableId][username][instance]
    ) {
      tableConsumerTransports[tableId][username][instance].transport.close();
      delete tableConsumerTransports[tableId][username][instance];

      if (
        Object.keys(
          tableConsumerTransports[tableId][username] || {
            break: true,
          }
        ).length === 0
      ) {
        delete tableConsumerTransports[tableId][username];

        if (
          Object.keys(
            tableConsumerTransports[tableId] || {
              break: true,
            }
          ).length === 0
        ) {
          delete tableConsumerTransports[tableId];
        }
      }
    }
  }

  releaseWorkers(tableId: string) {
    if (
      !tableProducerTransports[tableId] &&
      !tableConsumerTransports[tableId]
    ) {
      releaseWorker(workersMap[tableId]);
      delete workersMap[tableId];
    }
  }

  deleteProducerInstance(tableId: string, username: string, instance: string) {
    if (
      tableProducers[tableId] &&
      tableProducers[tableId][username] &&
      tableProducers[tableId][username][instance]
    ) {
      delete tableProducers[tableId][username][instance];

      this.clearTableProducers(tableId, username, instance);
    }
  }

  deleteConsumerInstance(tableId: string, username: string, instance: string) {
    if (
      tableConsumers[tableId] &&
      tableConsumers[tableId][username] &&
      tableConsumers[tableId][username][instance]
    ) {
      delete tableConsumers[tableId][username][instance];

      this.clearTableConsumers(tableId, username);
    }

    for (const consumerUsername in tableConsumers[tableId]) {
      for (const consumerInstance in tableConsumers[tableId][
        consumerUsername
      ]) {
        for (const producerUsername in tableConsumers[tableId][
          consumerUsername
        ][consumerInstance]) {
          if (producerUsername === username) {
            for (const producerInstance in tableConsumers[tableId][
              consumerUsername
            ][consumerInstance][producerUsername]) {
              if (producerInstance === instance) {
                delete tableConsumers[tableId][consumerUsername][
                  consumerInstance
                ][producerUsername][producerInstance];

                this.clearTableConsumers(
                  tableId,
                  consumerUsername,
                  consumerInstance,
                  producerUsername,
                  producerInstance
                );
              }
            }
          }
        }
      }
    }
  }

  removeProducer(
    tableId: string,
    username: string,
    instance: string,
    producerType: ProducerTypes,
    producerId?: string,
    dataStreamType?: DataStreamTypes
  ) {
    if (
      producerType === "json" &&
      dataStreamType &&
      tableProducers[tableId] &&
      tableProducers[tableId][username] &&
      tableProducers[tableId][username][instance] &&
      tableProducers[tableId][username][instance][producerType] &&
      tableProducers[tableId][username][instance][producerType][dataStreamType]
    ) {
      delete tableProducers[tableId][username][instance][producerType][
        dataStreamType
      ];

      this.clearTableProducers(tableId, username, instance, producerType);
    }

    if (
      (producerType === "camera" ||
        producerType === "screen" ||
        producerType === "screenAudio") &&
      producerId &&
      tableProducers[tableId] &&
      tableProducers[tableId][username] &&
      tableProducers[tableId][username][instance] &&
      tableProducers[tableId][username][instance][producerType] &&
      tableProducers[tableId][username][instance][producerType]?.[producerId]
    ) {
      delete tableProducers[tableId][username][instance][producerType]?.[
        producerId
      ];

      this.clearTableProducers(tableId, username, instance, producerType);
    }

    if (
      producerType === "audio" &&
      tableProducers[tableId] &&
      tableProducers[tableId][username] &&
      tableProducers[tableId][username][instance] &&
      tableProducers[tableId][username][instance][producerType]
    ) {
      delete tableProducers[tableId][username][instance][
        producerType as "audio"
      ];

      if (
        Object.keys(
          tableProducers[tableId][username][instance] || { break: true }
        ).length === 0
      ) {
        delete tableProducers[tableId][username][instance];

        if (
          Object.keys(tableProducers[tableId][username] || { break: true })
            .length === 0
        ) {
          delete tableProducers[tableId][username];

          if (
            Object.keys(tableProducers[tableId] || { break: true }).length === 0
          ) {
            delete tableProducers[tableId];
          }
        }
      }
    }
  }

  removeConsumer(
    tableId: string,
    username: string,
    instance: string,
    producerType: ProducerTypes,
    producerId?: string,
    dataStreamType?: DataStreamTypes
  ) {
    for (const consumerUsername in tableConsumers[tableId]) {
      for (const consumerInstance in tableConsumers[tableId][
        consumerUsername
      ]) {
        for (const producerUsername in tableConsumers[tableId][
          consumerUsername
        ][consumerInstance]) {
          if (producerUsername === username) {
            for (const producerInstance in tableConsumers[tableId][
              consumerUsername
            ][consumerInstance][producerUsername]) {
              if (producerInstance === instance) {
                for (const iterProducerType in tableConsumers[tableId][
                  consumerUsername
                ][consumerInstance][producerUsername][producerInstance]) {
                  if (iterProducerType === producerType) {
                    if (
                      iterProducerType === "json" &&
                      dataStreamType &&
                      tableConsumers[tableId][consumerUsername][
                        consumerInstance
                      ][producerUsername][producerInstance][iterProducerType]?.[
                        dataStreamType
                      ]
                    ) {
                      delete tableConsumers[tableId][consumerUsername][
                        consumerInstance
                      ][producerUsername][producerInstance][iterProducerType][
                        dataStreamType
                      ];

                      this.clearTableConsumers(
                        tableId,
                        consumerUsername,
                        consumerInstance,
                        producerUsername,
                        iterProducerType
                      );
                    }
                    if (
                      iterProducerType === "camera" ||
                      iterProducerType === "screen" ||
                      iterProducerType === "screenAudio"
                    ) {
                      for (const iterProducerId in tableConsumers[tableId][
                        consumerUsername
                      ][consumerInstance][producerUsername][producerInstance][
                        iterProducerType
                      ]) {
                        if (iterProducerId === producerId) {
                          delete tableConsumers[tableId][consumerUsername][
                            consumerInstance
                          ][producerUsername][producerInstance][
                            iterProducerType
                          ]?.[iterProducerId];

                          this.clearTableConsumers(
                            tableId,
                            consumerUsername,
                            consumerInstance,
                            producerUsername,
                            iterProducerType
                          );
                        }
                      }
                    }
                    if (iterProducerType === "audio") {
                      delete tableConsumers[tableId][consumerUsername][
                        consumerInstance
                      ][producerUsername][producerInstance][iterProducerType];

                      this.clearTableConsumers(
                        tableId,
                        consumerUsername,
                        consumerInstance,
                        producerUsername,
                        iterProducerType
                      );
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

export default MediasoupCleanup;
