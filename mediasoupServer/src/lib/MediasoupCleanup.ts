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
    table_id: string,
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
        tableConsumers[table_id][username][instance][producerUsername][
          producerInstance
        ][producerType] || {
          break: true,
        }
      ).length === 0
    ) {
      delete tableConsumers[table_id][username][instance][producerUsername][
        producerInstance
      ][producerType];
    }

    if (
      instance &&
      producerUsername &&
      producerInstance &&
      Object.keys(
        tableConsumers[table_id][username][instance][producerUsername][
          producerInstance
        ] || {
          break: true,
        }
      ).length === 0
    ) {
      delete tableConsumers[table_id][username][instance][producerUsername][
        producerInstance
      ];
    }

    if (
      instance &&
      producerUsername &&
      Object.keys(
        tableConsumers[table_id][username][instance][producerUsername] || {
          break: true,
        }
      ).length === 0
    ) {
      delete tableConsumers[table_id][username][instance][producerUsername];
    }

    if (
      instance &&
      Object.keys(
        tableConsumers[table_id][username][instance] || {
          break: true,
        }
      ).length === 0
    ) {
      delete tableConsumers[table_id][username][instance];
    }

    if (
      Object.keys(
        tableConsumers[table_id][username] || {
          break: true,
        }
      ).length === 0
    ) {
      delete tableConsumers[table_id][username];

      if (
        Object.keys(
          tableConsumers[table_id] || {
            break: true,
          }
        ).length === 0
      ) {
        delete tableConsumers[table_id];
      }
    }
  }

  clearTableProducers(
    table_id: string,
    username: string,
    instance: string,
    producerType?: ProducerTypes
  ) {
    if (
      producerType &&
      Object.keys(
        tableProducers[table_id][username][instance][producerType] || {
          break: true,
        }
      ).length === 0
    ) {
      delete tableProducers[table_id][username][instance][producerType];
    }

    if (
      Object.keys(
        tableProducers[table_id][username][instance] || {
          break: true,
        }
      ).length === 0
    ) {
      delete tableProducers[table_id][username][instance];
    }

    if (
      Object.keys(
        tableProducers[table_id][username] || {
          break: true,
        }
      ).length === 0
    ) {
      delete tableProducers[table_id][username];

      if (
        Object.keys(
          tableProducers[table_id] || {
            break: true,
          }
        ).length === 0
      ) {
        delete tableProducers[table_id];
      }
    }
  }

  deleteProducerTransports(
    table_id: string,
    username: string,
    instance: string
  ) {
    if (
      tableProducerTransports[table_id] &&
      tableProducerTransports[table_id][username] &&
      tableProducerTransports[table_id][username][instance]
    ) {
      tableProducerTransports[table_id][username][instance].transport.close();
      delete tableProducerTransports[table_id][username][instance];

      if (
        Object.keys(
          tableProducerTransports[table_id][username] || {
            break: true,
          }
        ).length === 0
      ) {
        delete tableProducerTransports[table_id][username];

        if (
          Object.keys(tableProducerTransports[table_id] || { break: true })
            .length === 0
        ) {
          delete tableProducerTransports[table_id];
        }
      }
    }
  }

  deleteConsumerTransport(
    table_id: string,
    username: string,
    instance: string
  ) {
    if (
      tableConsumerTransports[table_id] &&
      tableConsumerTransports[table_id][username] &&
      tableConsumerTransports[table_id][username][instance]
    ) {
      tableConsumerTransports[table_id][username][instance].transport.close();
      delete tableConsumerTransports[table_id][username][instance];

      if (
        Object.keys(
          tableConsumerTransports[table_id][username] || {
            break: true,
          }
        ).length === 0
      ) {
        delete tableConsumerTransports[table_id][username];

        if (
          Object.keys(
            tableConsumerTransports[table_id] || {
              break: true,
            }
          ).length === 0
        ) {
          delete tableConsumerTransports[table_id];
        }
      }
    }
  }

  releaseWorkers(table_id: string) {
    if (
      !tableProducerTransports[table_id] &&
      !tableConsumerTransports[table_id]
    ) {
      releaseWorker(workersMap[table_id]);
      delete workersMap[table_id];
    }
  }

  deleteProducerInstance(table_id: string, username: string, instance: string) {
    if (
      tableProducers[table_id] &&
      tableProducers[table_id][username] &&
      tableProducers[table_id][username][instance]
    ) {
      delete tableProducers[table_id][username][instance];

      this.clearTableProducers(table_id, username, instance);
    }
  }

  deleteConsumerInstance(table_id: string, username: string, instance: string) {
    if (
      tableConsumers[table_id] &&
      tableConsumers[table_id][username] &&
      tableConsumers[table_id][username][instance]
    ) {
      delete tableConsumers[table_id][username][instance];

      this.clearTableConsumers(table_id, username);
    }

    for (const consumerUsername in tableConsumers[table_id]) {
      for (const consumerInstance in tableConsumers[table_id][
        consumerUsername
      ]) {
        for (const producerUsername in tableConsumers[table_id][
          consumerUsername
        ][consumerInstance]) {
          if (producerUsername === username) {
            for (const producerInstance in tableConsumers[table_id][
              consumerUsername
            ][consumerInstance][producerUsername]) {
              if (producerInstance === instance) {
                delete tableConsumers[table_id][consumerUsername][
                  consumerInstance
                ][producerUsername][producerInstance];

                this.clearTableConsumers(
                  table_id,
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
    table_id: string,
    username: string,
    instance: string,
    producerType: ProducerTypes,
    producerId?: string,
    dataStreamType?: DataStreamTypes
  ) {
    if (
      producerType === "json" &&
      dataStreamType &&
      tableProducers[table_id] &&
      tableProducers[table_id][username] &&
      tableProducers[table_id][username][instance] &&
      tableProducers[table_id][username][instance][producerType] &&
      tableProducers[table_id][username][instance][producerType][dataStreamType]
    ) {
      delete tableProducers[table_id][username][instance][producerType][
        dataStreamType
      ];

      this.clearTableProducers(table_id, username, instance, producerType);
    }

    if (
      (producerType === "camera" ||
        producerType === "screen" ||
        producerType === "screenAudio") &&
      producerId &&
      tableProducers[table_id] &&
      tableProducers[table_id][username] &&
      tableProducers[table_id][username][instance] &&
      tableProducers[table_id][username][instance][producerType] &&
      tableProducers[table_id][username][instance][producerType]?.[producerId]
    ) {
      delete tableProducers[table_id][username][instance][producerType]?.[
        producerId
      ];

      this.clearTableProducers(table_id, username, instance, producerType);
    }

    if (
      producerType === "audio" &&
      tableProducers[table_id] &&
      tableProducers[table_id][username] &&
      tableProducers[table_id][username][instance] &&
      tableProducers[table_id][username][instance][producerType]
    ) {
      delete tableProducers[table_id][username][instance][
        producerType as "audio"
      ];

      if (
        Object.keys(
          tableProducers[table_id][username][instance] || { break: true }
        ).length === 0
      ) {
        delete tableProducers[table_id][username][instance];

        if (
          Object.keys(tableProducers[table_id][username] || { break: true })
            .length === 0
        ) {
          delete tableProducers[table_id][username];

          if (
            Object.keys(tableProducers[table_id] || { break: true }).length ===
            0
          ) {
            delete tableProducers[table_id];
          }
        }
      }
    }
  }

  removeConsumer(
    table_id: string,
    username: string,
    instance: string,
    producerType: ProducerTypes,
    producerId?: string,
    dataStreamType?: DataStreamTypes
  ) {
    for (const consumerUsername in tableConsumers[table_id]) {
      for (const consumerInstance in tableConsumers[table_id][
        consumerUsername
      ]) {
        for (const producerUsername in tableConsumers[table_id][
          consumerUsername
        ][consumerInstance]) {
          if (producerUsername === username) {
            for (const producerInstance in tableConsumers[table_id][
              consumerUsername
            ][consumerInstance][producerUsername]) {
              if (producerInstance === instance) {
                for (const iterProducerType in tableConsumers[table_id][
                  consumerUsername
                ][consumerInstance][producerUsername][producerInstance]) {
                  if (iterProducerType === producerType) {
                    if (
                      iterProducerType === "json" &&
                      dataStreamType &&
                      tableConsumers[table_id][consumerUsername][
                        consumerInstance
                      ][producerUsername][producerInstance][iterProducerType]?.[
                        dataStreamType
                      ]
                    ) {
                      delete tableConsumers[table_id][consumerUsername][
                        consumerInstance
                      ][producerUsername][producerInstance][iterProducerType][
                        dataStreamType
                      ];

                      this.clearTableConsumers(
                        table_id,
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
                      for (const iterProducerId in tableConsumers[table_id][
                        consumerUsername
                      ][consumerInstance][producerUsername][producerInstance][
                        iterProducerType
                      ]) {
                        if (iterProducerId === producerId) {
                          delete tableConsumers[table_id][consumerUsername][
                            consumerInstance
                          ][producerUsername][producerInstance][
                            iterProducerType
                          ]?.[iterProducerId];

                          this.clearTableConsumers(
                            table_id,
                            consumerUsername,
                            consumerInstance,
                            producerUsername,
                            iterProducerType
                          );
                        }
                      }
                    }
                    if (iterProducerType === "audio") {
                      delete tableConsumers[table_id][consumerUsername][
                        consumerInstance
                      ][producerUsername][producerInstance][iterProducerType];

                      this.clearTableConsumers(
                        table_id,
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
