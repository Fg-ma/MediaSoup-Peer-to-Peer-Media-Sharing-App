import {
  tableConsumers,
  tableConsumerTransports,
  tableProducers,
  tableProducerTransports,
  workersMap,
} from "../mediasoupVars";
import { releaseWorker } from "../workerManager";
import { ProducerTypes } from "./typeConstant";

class MediasoupCleanup {
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

  // Delete producer transports
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

  // Delete consumer transports
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

  // Release workers if necessary
  releaseWorkers(table_id: string) {
    if (
      !tableProducerTransports[table_id] &&
      !tableConsumerTransports[table_id]
    ) {
      releaseWorker(workersMap[table_id]);
      delete workersMap[table_id];
    }
  }

  // Delete producer
  deleteProducer(table_id: string, username: string, instance: string) {
    if (
      tableProducers[table_id] &&
      tableProducers[table_id][username] &&
      tableProducers[table_id][username][instance]
    ) {
      delete tableProducers[table_id][username][instance];

      this.clearTableProducers(table_id, username, instance);
    }
  }

  // Delete consumer
  deleteConsumer(table_id: string, username: string, instance: string) {
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

  // Remove producers
  removeProducer(
    table_id: string,
    username: string,
    instance: string,
    producerType: ProducerTypes,
    producerId?: string
  ) {
    if (
      (producerType === "camera" ||
        producerType === "screen" ||
        producerType === "json") &&
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
    producerId?: string
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
                  if (
                    iterProducerType === producerType &&
                    (iterProducerType === "camera" ||
                      iterProducerType === "screen" ||
                      iterProducerType === "json")
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
                  if (
                    iterProducerType === producerType &&
                    iterProducerType === "audio"
                  ) {
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

export default MediasoupCleanup;
