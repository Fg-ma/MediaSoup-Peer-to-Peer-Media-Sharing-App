package com.example.kafka;

import org.apache.kafka.connect.connector.ConnectRecord;
import org.apache.kafka.connect.transforms.Transformation;
import org.apache.kafka.connect.data.Schema;
import org.apache.kafka.common.config.ConfigDef;
import org.apache.kafka.connect.errors.DataException;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * An SMT that filters record values to only include a configured whitelist of fields per topic.
 */
public class Whitelist<R extends ConnectRecord<R>> implements Transformation<R> {
    private static final String WHITELIST_CONFIG = "json.whitelist";

    private final Map<String, Set<String>> topicWhitelist = new HashMap<>();

    @Override
    @SuppressWarnings("unchecked")
    public R apply(R record) {
        // Pass through tombstone
        if (record.value() == null) {
            return record;
        }

        // Expect value to be a Map
        Map<String, Object> valueMap;
        try {
            valueMap = (Map<String, Object>) record.value();
        } catch (ClassCastException e) {
            throw new DataException("Record value is not a Map<String,Object>", e);
        }

        // Filter fields according to whitelist for this topic
        Set<String> allowed = topicWhitelist.getOrDefault(record.topic(), Collections.emptySet());
        Map<String, Object> whitelisted = valueMap.entrySet().stream()
            .filter(e -> allowed.contains(e.getKey()))
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        // Return new record with filtered value map
        return record.newRecord(
            record.topic(),
            record.kafkaPartition(),
            record.keySchema(), record.key(),
            (Schema) null, whitelisted,
            record.timestamp()
        );
    }

    @Override
    public ConfigDef config() {
        return new ConfigDef()
            .define(
                WHITELIST_CONFIG,
                ConfigDef.Type.LIST,
                Collections.emptyList(),
                ConfigDef.Importance.HIGH,
                "Comma-separated list of topic:field1|field2 mappings, e.g. tbl1:n|x,tbl2:other"
            );
    }

    @Override
    public void configure(Map<String, ?> configs) {
        Object raw = configs.get(WHITELIST_CONFIG);
        List<String> entries;
        if (raw instanceof List) {
            entries = ((List<?>) raw).stream()
                .map(Object::toString)
                .collect(Collectors.toList());
        } else {
            entries = List.of(raw.toString().split("\\s*,\\s*"));
        }

        for (String entry : entries) {
            String[] parts = entry.split(":", 2);
            if (parts.length != 2) {
                continue;
            }
            String topic = parts[0];
            Set<String> fields = Set.of(parts[1].split("\\|"));
            topicWhitelist.put(topic, new HashSet<>(fields));
        }
    }

    @Override
    public void close() {
        // No resources to clean up
    }
}

